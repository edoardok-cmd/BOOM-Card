from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.providers.postgres.operators.postgres import PostgresOperator
from airflow.providers.postgres.hooks.postgres import PostgresHook
from airflow.providers.redis.hooks.redis import RedisHook
from airflow.utils.task_group import TaskGroup
import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
import json
import logging

logger = logging.getLogger(__name__)

# Default arguments for the DAG
default_args = {
    'owner': 'boom-analytics',
    'depends_on_past': False,
    'start_date': datetime(2024, 1, 1),
    'email': ['analytics@boomcard.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'execution_timeout': timedelta(hours=2),
}

# DAG definition
dag = DAG(
    'boom_card_analytics_pipeline',
    default_args=default_args,
    description='Analytics pipeline for BOOM Card platform metrics and insights',
    schedule_interval='0 2 * * *',  # Daily at 2 AM
    catchup=False,
    tags=['analytics', 'reporting', 'kpi'],
)

def get_postgres_connection():
    """Get PostgreSQL connection"""
    return PostgresHook(postgres_conn_id='boom_postgres').get_conn()

def get_redis_connection():
    """Get Redis connection"""
    return RedisHook(redis_conn_id='boom_redis').get_conn()

def calculate_transaction_metrics(**context):
    """Calculate transaction-based metrics"""
    try:
        conn = get_postgres_connection()
        execution_date = context['execution_date']
        
        # Transaction volume metrics
        query = """
        SELECT 
            DATE_TRUNC('day', created_at) as transaction_date,
            partner_id,
            user_id,
            COUNT(*) as transaction_count,
            SUM(original_amount) as total_original_amount,
            SUM(discount_amount) as total_discount_amount,
            SUM(final_amount) as total_final_amount,
            AVG(discount_percentage) as avg_discount_percentage,
            COUNT(DISTINCT user_id) as unique_users,
            COUNT(DISTINCT partner_id) as unique_partners
        FROM transactions
        WHERE created_at >= %s AND created_at < %s
            AND status = 'completed'
        GROUP BY DATE_TRUNC('day', created_at), partner_id, user_id
        """
        
        df = pd.read_sql(
            query, 
            conn, 
            params=(execution_date - timedelta(days=1), execution_date)
        )
        
        # Calculate additional metrics
        if not df.empty:
            metrics = {
                'daily_transactions': int(df['transaction_count'].sum()),
                'daily_revenue': float(df['total_final_amount'].sum()),
                'daily_savings': float(df['total_discount_amount'].sum()),
                'avg_transaction_value': float(df['total_final_amount'].mean()),
                'avg_discount_rate': float(df['avg_discount_percentage'].mean()),
                'active_users': int(df['unique_users'].sum()),
                'active_partners': int(df['unique_partners'].sum()),
                'date': execution_date.strftime('%Y-%m-%d')
            }
            
            # Store in Redis for real-time access
            redis = get_redis_connection()
            redis.setex(
                f"analytics:daily:transactions:{execution_date.strftime('%Y%m%d')}",
                86400 * 7,  # 7 days TTL
                json.dumps(metrics)
            )
            
            return metrics
        
        return {}
        
    except Exception as e:
        logger.error(f"Error calculating transaction metrics: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

def calculate_partner_performance(**context):
    """Calculate partner performance metrics"""
    try:
        conn = get_postgres_connection()
        execution_date = context['execution_date']
        
        query = """
        WITH partner_metrics AS (
            SELECT 
                p.id as partner_id,
                p.name as partner_name,
                p.category,
                p.location_city,
                COUNT(DISTINCT t.id) as transaction_count,
                COUNT(DISTINCT t.user_id) as unique_customers,
                SUM(t.original_amount) as gross_revenue,
                SUM(t.discount_amount) as total_discounts,
                SUM(t.final_amount) as net_revenue,
                AVG(t.discount_percentage) as avg_discount,
                COUNT(DISTINCT DATE_TRUNC('day', t.created_at)) as active_days
            FROM partners p
            LEFT JOIN transactions t ON p.id = t.partner_id
            WHERE t.created_at >= %s AND t.created_at < %s
                AND t.status = 'completed'
            GROUP BY p.id, p.name, p.category, p.location_city
        )
        SELECT 
            *,
            CASE 
                WHEN unique_customers > 0 
                THEN gross_revenue / unique_customers 
                ELSE 0 
            END as avg_customer_value,
            CASE 
                WHEN transaction_count > 0 
                THEN unique_customers::float / transaction_count 
                ELSE 0 
            END as repeat_rate
        FROM partner_metrics
        ORDER BY net_revenue DESC
        """
        
        df = pd.read_sql(
            query,
            conn,
            params=(execution_date - timedelta(days=30), execution_date)
        )
        
        if not df.empty:
            # Store partner rankings
            redis = get_redis_connection()
            
            # Top performing partners by category
            for category in df['category'].unique():
                category_df = df[df['category'] == category].head(20)
                redis.setex(
                    f"analytics:partners:top:{category}:{execution_date.strftime('%Y%m%d')}",
                    86400 * 7,
                    category_df.to_json(orient='records')
                )
            
            # Overall top partners
            top_partners = df.head(50).to_dict('records')
            redis.setex(
                f"analytics:partners:top:overall:{execution_date.strftime('%Y%m%d')}",
                86400 * 7,
                json.dumps(top_partners)
            )
            
            return {'processed_partners': len(df)}
        
        return {'processed_partners': 0}
        
    except Exception as e:
        logger.error(f"Error calculating partner performance: {str(e)}")
        raise
    finally:
        if conn:
            conn.close()

def calculate_user_behavior(**context):
    """Analyze user behavior patterns"""
    try:
        conn = get_postgres_connection()
        execution_date = context['execution_date']
        
        # User engagement metrics
        query = """
        WITH user_metrics AS (
            SELECT 
                u.id as user_id,
                u.subscription_type,
                u.created_at as user_created_at,
                COUNT(DISTINCT t.id) as transaction_count,
                COUNT(DISTINCT t.partner_id) as unique_partners_visited,
                COUNT(DISTINCT t.partner_category) as unique_categories_visited,
                SUM(t.discount_amount) as total_savings,
                AVG(t.discount_percentage) as avg_discount_used,
                MAX(t.created_at) as last_transaction_date,
                MIN(t.created_at) as first_transaction_date
            FROM users u
            LEFT JOIN transactions t ON u.id = t.user_id
            WHERE t.created_at >= %s AND t.created_at < %s
                AND t.status = 'completed'
            GROUP BY u.id, u.subscription_type, u.created_at
        )
        SELECT 
            subscription_type,
            COUNT(DISTINCT user_id) as active_users,
            AVG(transaction_count) as avg_transactions_per_user,
            AVG(unique_partners_visited) as avg_partners_per_user,
            AVG(unique_categories_visited) as avg_categories_per_user,
            AVG(total_savings) as avg_savings_per_user,
            AVG(avg_discount_used) as avg_discount_rate,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY transaction_count) as median_transactions,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY total_savings) as median_savings
        FROM user_metrics
        GROUP BY subscription_type
        """
        
        df = pd.read_sql(
            query,
            conn,
            params=(execution_date - timedelta(days=30), execution_date)
        )
        
        # User retention cohorts
        retention_query = """
        WITH cohorts AS (
            SELECT 
                DATE_TRUNC('month', u.created_at) as cohort_month,
                u.id as user_id,
                DATE_TRUNC('month', t.created_at) as transaction_month
            FROM users u
            LEFT JOIN transactions t ON u.id = t.user_id
            WHERE u.created_at >= %s 
                AND t.status = 'completed'
        )
        SELECT 
            cohort_month,
            transaction_month,
            COUNT(DISTINCT user_id) as active_users
        FROM cohorts
        GROUP BY cohort_month, transaction_month
        ORDER BY cohort_month, transaction_month
        """
        
        retention_df = pd.read_sql(
            retention_query,
            conn,
            params=(execution_date - timedelta(days=365),)
        )
        
        # Calculate retention rates
        if not retention_df.empty:
            retention_pivot = retention_df.pivot(
                index='cohort_month',
                columns='transaction_month',
                values='active_users'
            )
            
            # Calculate retention percentages
            for col in retention_pivot.columns:
                retention_pivot[col] = retention_pivot[col] / retention_pivot.iloc[:, 0] * 100
            
            # Store retention data
          