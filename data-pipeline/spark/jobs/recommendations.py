```python
#!/usr/bin/env python3
"""
BOOM Card Recommendation Engine
Spark job for generating personalized recommendations based on user behavior,
preferences, and collaborative filtering.
"""

import sys
import os
import json
import logging
from datetime import datetime, timedelta
from typing import List, Dict, Tuple, Optional, Any
import numpy as np
from pyspark.sql import SparkSession, DataFrame, Window
from pyspark.sql import functions as F
from pyspark.sql.types import (
    StructType, StructField, StringType, IntegerType, 
    FloatType, ArrayType, TimestampType, BooleanType
)
from pyspark.ml.feature import VectorAssembler, StandardScaler
from pyspark.ml.recommendation import ALS
from pyspark.ml.evaluation import RegressionEvaluator
from pyspark.ml.clustering import KMeans
from pyspark.ml.linalg import Vectors
import redis
import psycopg2
from psycopg2.extras import RealDictCursor

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RecommendationEngine:
    """Main recommendation engine for BOOM Card platform"""
    
    def __init__(self, spark: SparkSession, config: Dict[str, Any]):
        self.spark = spark
        self.config = config
        self.redis_client = self._init_redis()
        self.db_conn = self._init_postgres()
        
        # ML model parameters
        self.als_rank = config.get('als_rank', 50)
        self.als_iterations = config.get('als_iterations', 10)
        self.als_reg_param = config.get('als_reg_param', 0.01)
        self.kmeans_k = config.get('kmeans_clusters', 10)
        
        # Recommendation parameters
        self.num_recommendations = config.get('num_recommendations', 20)
        self.min_interactions = config.get('min_interactions', 5)
        self.recency_weight = config.get('recency_weight', 0.8)
        
    def _init_redis(self) -> redis.Redis:
        """Initialize Redis connection for caching"""
        return redis.Redis(
            host=self.config['redis_host'],
            port=self.config['redis_port'],
            password=self.config.get('redis_password'),
            decode_responses=True,
            socket_keepalive=True,
            socket_keepalive_options={
                1: 1,  # TCP_KEEPIDLE
                2: 1,  # TCP_KEEPINTVL
                3: 5,  # TCP_KEEPCNT
            }
        )
    
    def _init_postgres(self) -> psycopg2.extensions.connection:
        """Initialize PostgreSQL connection"""
        return psycopg2.connect(
            host=self.config['postgres_host'],
            port=self.config['postgres_port'],
            database=self.config['postgres_db'],
            user=self.config['postgres_user'],
            password=self.config['postgres_password'],
            cursor_factory=RealDictCursor
        )
    
    def load_data(self) -> Tuple[DataFrame, DataFrame, DataFrame, DataFrame]:
        """Load data from PostgreSQL and prepare DataFrames"""
        logger.info("Loading data from PostgreSQL...")
        
        # User interactions (visits, redemptions, favorites)
        interactions_query = """
            SELECT 
                u.id as user_id,
                p.id as partner_id,
                CASE 
                    WHEN r.id IS NOT NULL THEN 5.0
                    WHEN f.id IS NOT NULL THEN 4.0
                    WHEN v.view_count > 5 THEN 3.0
                    WHEN v.view_count > 2 THEN 2.0
                    ELSE 1.0
                END as rating,
                COALESCE(r.created_at, f.created_at, v.last_viewed_at) as timestamp,
                u.preferred_language,
                u.city,
                u.age_group,
                u.subscription_tier
            FROM users u
            LEFT JOIN redemptions r ON u.id = r.user_id
            LEFT JOIN favorites f ON u.id = f.user_id
            LEFT JOIN partner_views v ON u.id = v.user_id
            WHERE u.is_active = true
                AND (r.id IS NOT NULL OR f.id IS NOT NULL OR v.id IS NOT NULL)
                AND COALESCE(r.created_at, f.created_at, v.last_viewed_at) > NOW() - INTERVAL '6 months'
        """
        
        # Partner features
        partners_query = """
            SELECT 
                p.id as partner_id,
                p.category_id,
                pc.name as category_name,
                p.subcategory_id,
                p.city,
                p.average_discount,
                p.price_range,
                p.rating as partner_rating,
                p.total_redemptions,
                p.total_views,
                p.is_premium,
                p.has_multiple_locations,
                ARRAY_AGG(DISTINCT t.name) as tags,
                COUNT(DISTINCT l.id) as location_count,
                AVG(r.rating) as avg_user_rating
            FROM partners p
            JOIN partner_categories pc ON p.category_id = pc.id
            LEFT JOIN partner_tags pt ON p.id = pt.partner_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            LEFT JOIN locations l ON p.id = l.partner_id
            LEFT JOIN reviews r ON p.id = r.partner_id
            WHERE p.is_active = true
            GROUP BY p.id, pc.id, pc.name
        """
        
        # User features
        users_query = """
            SELECT 
                u.id as user_id,
                u.age_group,
                u.city,
                u.preferred_language,
                u.subscription_tier,
                u.registration_date,
                COUNT(DISTINCT r.partner_id) as redemption_count,
                COUNT(DISTINCT f.partner_id) as favorite_count,
                AVG(r.savings_amount) as avg_savings,
                ARRAY_AGG(DISTINCT pc.id) as preferred_categories
            FROM users u
            LEFT JOIN redemptions r ON u.id = r.user_id
            LEFT JOIN favorites f ON u.id = f.user_id
            LEFT JOIN partners p ON r.partner_id = p.id OR f.partner_id = p.id
            LEFT JOIN partner_categories pc ON p.category_id = pc.id
            WHERE u.is_active = true
            GROUP BY u.id
        """
        
        # Trending partners
        trending_query = """
            SELECT 
                p.id as partner_id,
                COUNT(DISTINCT r.user_id) as recent_redemptions,
                COUNT(DISTINCT v.user_id) as recent_views,
                AVG(rev.rating) as recent_rating
            FROM partners p
            LEFT JOIN redemptions r ON p.id = r.partner_id 
                AND r.created_at > NOW() - INTERVAL '7 days'
            LEFT JOIN partner_views v ON p.id = v.partner_id 
                AND v.last_viewed_at > NOW() - INTERVAL '7 days'
            LEFT JOIN reviews rev ON p.id = rev.partner_id 
                AND rev.created_at > NOW() - INTERVAL '30 days'
            WHERE p.is_active = true
            GROUP BY p.id
            HAVING COUNT(DISTINCT r.user_id) > 0 OR COUNT(DISTINCT v.user_id) > 0
        """
        
        # Convert to Spark DataFrames
        interactions_df = self._query_to_df(interactions_query)
        partners_df = self._query_to_df(partners_query)
        users_df = self._query_to_df(users_query)
        trending_df = self._query_to_df(trending_query)
        
        return interactions_df, partners_df, users_df, trending_df
    
    def _query_to_df(self, query: str) -> DataFrame:
        """Execute query and convert to Spark DataFrame"""
        with self.db_conn.cursor() as cursor:
            cursor.execute(query)
            rows = cursor.fetchall()
            
        if not rows:
            return self.spark.createDataFrame([], StructType([]))
            
        # Convert to Spark DataFrame
        columns = list(rows[0].keys())
        data = [list(row.values()) for row in rows]
        
        return self.spark.createDataFrame(data, columns)
    
    def preprocess_data(
        self, 
        interactions_df: DataFrame, 
        partners_df: DataFrame, 
        users_df: DataFrame
    ) -> Tuple[DataFrame, DataFrame, DataFrame]:
        """Preprocess and feature engineer the data"""
        logger.info("Preprocessing data...")
        
        # Apply recency weighting to interactions
        current_timestamp = F.current_timestamp()
        interactions_df = interactions_df.withColumn(
            'days_ago',
            F.datediff(current_timestamp, F.col('timestamp'))
        ).withColumn(
            'recency_weight',
            F.when(F.col('days_ago') <= 7, 1.0)
             .when(F.col('days_ago') <= 30, 0.9)
             .when(F.col('days_ago') <= 90, 0.7)
             .otherwise(0.5)
        ).withColumn(
            'weighted_rating',
            F.col('rating') * F.col('recency_weight') * self.recency_weight
        )
        
        # Encode categorical features for partners
        partners_df = self._encode_partner_features(partners_df)
        
        # Encode categorical features for users
        users_df = self._encode_user_features(users_df)
        
        # Filter out users with insufficient interactions
        active_users = interactions_df.groupBy('user_id').agg(
            F.count('*').alias('interaction_count')
        ).filter(F.col('interaction_count') >= self.min_interactions)
        
        interactions_df = interactions_df.join(
            active_users.select('user_id'),
            on='user_id',
            how='inner'
        )
        
        return interactions_df, partners_df, users_df
    
    def _encode_partner_features(self, df: DataFrame) -> DataFrame:
        """Encode partner categorical features"""
        from pyspark.ml.feature import StringIndexer, OneHotEncoder
        
        # Category encoding
        category_indexer = StringIndexer(
            inputCol='category_name',
            outputCol='category_index'
        )
        df = category_indexer.fit(df).transform(df)
        
        # Price range encoding
        df = df.withColumn(
            'pric