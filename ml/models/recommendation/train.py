import os
import sys
import json
import logging
import pickle
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional, Any
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import mean_squared_error, mean_absolute_error
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import Ridge
from sklearn.neural_network import MLPRegressor
import xgboost as xgb
import joblib
from scipy.sparse import csr_matrix
from scipy.spatial.distance import cosine
import psycopg2
from psycopg2.extras import RealDictCursor
import redis
import schedule
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class RecommendationModelTrainer:
    """Train and manage recommendation models for BOOM Card platform"""
    
    def __init__(self, config_path: str = 'config/ml_config.json'):
        """Initialize trainer with configuration"""
        self.config = self._load_config(config_path)
        self.db_conn = None
        self.redis_client = None
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_importance = {}
        
    def _load_config(self, config_path: str) -> Dict[str, Any]:
        """Load configuration from JSON file"""
        try:
            with open(config_path, 'r') as f:
                config = json.load(f)
            return config
        except Exception as e:
            logger.error(f"Failed to load config: {e}")
            # Return default config
            return {
                "database": {
                    "host": os.getenv("DB_HOST", "localhost"),
                    "port": int(os.getenv("DB_PORT", 5432)),
                    "name": os.getenv("DB_NAME", "boom_card"),
                    "user": os.getenv("DB_USER", "postgres"),
                    "password": os.getenv("DB_PASSWORD", "")
                },
                "redis": {
                    "host": os.getenv("REDIS_HOST", "localhost"),
                    "port": int(os.getenv("REDIS_PORT", 6379)),
                    "db": int(os.getenv("REDIS_DB", 0))
                },
                "models": {
                    "collaborative_filtering": {
                        "enabled": True,
                        "min_interactions": 5
                    },
                    "content_based": {
                        "enabled": True,
                        "similarity_threshold": 0.3
                    },
                    "hybrid": {
                        "enabled": True,
                        "cf_weight": 0.6,
                        "cb_weight": 0.4
                    }
                },
                "training": {
                    "test_size": 0.2,
                    "random_state": 42,
                    "cv_folds": 5,
                    "retrain_hours": 24
                }
            }
            
    def connect_db(self):
        """Establish database connection"""
        try:
            self.db_conn = psycopg2.connect(
                host=self.config['database']['host'],
                port=self.config['database']['port'],
                database=self.config['database']['name'],
                user=self.config['database']['user'],
                password=self.config['database']['password']
            )
            logger.info("Database connection established")
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise
            
    def connect_redis(self):
        """Establish Redis connection"""
        try:
            self.redis_client = redis.Redis(
                host=self.config['redis']['host'],
                port=self.config['redis']['port'],
                db=self.config['redis']['db'],
                decode_responses=True
            )
            self.redis_client.ping()
            logger.info("Redis connection established")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
            
    def fetch_training_data(self) -> pd.DataFrame:
        """Fetch training data from database"""
        query = """
        WITH user_interactions AS (
            SELECT 
                t.user_id,
                t.partner_id,
                p.category_id,
                p.subcategory_id,
                p.location_city,
                p.location_district,
                p.average_rating,
                p.total_reviews,
                t.discount_amount,
                t.transaction_amount,
                t.created_at,
                EXTRACT(HOUR FROM t.created_at) as hour_of_day,
                EXTRACT(DOW FROM t.created_at) as day_of_week,
                EXTRACT(MONTH FROM t.created_at) as month,
                COUNT(*) OVER (PARTITION BY t.user_id, t.partner_id) as user_partner_count,
                COUNT(*) OVER (PARTITION BY t.user_id) as user_total_transactions,
                AVG(t.transaction_amount) OVER (PARTITION BY t.user_id) as user_avg_spend,
                COUNT(*) OVER (PARTITION BY t.user_id, p.category_id) as user_category_count
            FROM transactions t
            JOIN partners p ON t.partner_id = p.id
            WHERE t.status = 'completed'
                AND t.created_at >= NOW() - INTERVAL '6 months'
        ),
        user_preferences AS (
            SELECT 
                up.user_id,
                up.preferred_categories,
                up.dietary_restrictions,
                up.budget_preference,
                up.preferred_locations
            FROM user_profiles up
        )
        SELECT 
            ui.*,
            up.preferred_categories,
            up.dietary_restrictions,
            up.budget_preference,
            up.preferred_locations,
            CASE 
                WHEN ui.user_partner_count > 3 THEN 5
                WHEN ui.user_partner_count > 2 THEN 4
                WHEN ui.user_partner_count > 1 THEN 3
                ELSE 2
            END as implicit_rating
        FROM user_interactions ui
        LEFT JOIN user_preferences up ON ui.user_id = up.user_id
        """
        
        try:
            with self.db_conn.cursor(cursor_factory=RealDictCursor) as cursor:
                cursor.execute(query)
                data = cursor.fetchall()
                df = pd.DataFrame(data)
                logger.info(f"Fetched {len(df)} training records")
                return df
        except Exception as e:
            logger.error(f"Failed to fetch training data: {e}")
            raise
            
    def preprocess_data(self, df: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Preprocess data for model training"""
        # Handle missing values
        df['average_rating'] = df['average_rating'].fillna(df['average_rating'].mean())
        df['total_reviews'] = df['total_reviews'].fillna(0)
        df['dietary_restrictions'] = df['dietary_restrictions'].fillna('none')
        df['budget_preference'] = df['budget_preference'].fillna('medium')
        
        # Create time-based features
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_lunch'] = df['hour_of_day'].between(11, 14).astype(int)
        df['is_dinner'] = df['hour_of_day'].between(18, 22).astype(int)
        
        # Encode categorical variables
        categorical_cols = ['category_id', 'subcategory_id', 'location_city', 
                          'location_district', 'dietary_restrictions', 'budget_preference']
        
        encoders = {}
        for col in categorical_cols:
            le = LabelEncoder()
            df[f'{col}_encoded'] = le.fit_transform(df[col].astype(str))
            encoders[col] = le
            
        # Scale numerical features
        numerical_cols = ['average_rating', 'total_reviews', 'discount_amount',
                         'transaction_amount', 'user_total_transactions', 
                         'user_avg_spend', 'user_category_count']
        
        scaler = StandardScaler()
        df[numerical_cols] = scaler.fit_transform(df[numerical_cols])
        
        # Store preprocessing objects
        preprocessing_objects = {
            'encoders': encoders,
            'scaler': scaler,
            'feature_columns': numerical_cols + [f'{col}_encoded' for col in categorical_cols]
        }
        
        return df, preprocessing_objects
        
    def create_user_item_matrix(self, df: pd.DataFrame) -> csr_matrix:
        """Create sparse user-item interaction matrix"""
        # Pivot table for user-item interactions
        user_item_df = df.pivot_table(
            index='user_id',
            columns='partner_id',
            values='implicit_rating',
            fill_value=0
        )
        
        # Convert to sparse matrix for efficiency
        user_item_matrix = csr_matrix(user_item_df.values)
        
        # Store mapping
        self.user_mapping = {user: idx for idx, user in enumerate(user_item_df.index)}
        self.item_mapping = {item: idx for idx, item in enumerate(user_item_df.columns)}
        self.reverse_item_mapping = {idx: item for item, idx in self.item_mapping.items()}
        
        return user_item_matrix
        
    def train_collaborative_filtering(self, user_item_matrix: csr_matrix) -> Dict[str, Any]:
        """Train collaborative filtering model using matrix factorization"""
        from sklearn.decomposition import TruncatedSVD
        
        logger.info("Training collaborative filtering model...")
        
        # Use SVD for matrix factorization
        n_components = min(50, user_item_matrix.shape[0] - 1, user_item_matrix.shape[1] - 1)
        svd = TruncatedSVD(n_components=n_components, rando