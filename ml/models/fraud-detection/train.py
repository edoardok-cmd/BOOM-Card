import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import joblib
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, IsolationForest
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score
from sklearn.feature_selection import SelectKBest, f_classif
import xgboost as xgb
from imblearn.over_sampling import SMOTE
from imblearn.under_sampling import RandomUnderSampler
from imblearn.pipeline import Pipeline as ImbPipeline
import warnings
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
import json
from typing import Dict, List, Tuple, Optional, Any
import hashlib

warnings.filterwarnings('ignore')

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('fraud_detection_training.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class FraudDetectionTrainer:
    """
    Fraud detection model trainer for BOOM Card platform.
    Detects anomalous transaction patterns and potential fraud.
    """
    
    def __init__(self, db_config: Dict[str, str]):
        """
        Initialize the fraud detection trainer.
        
        Args:
            db_config: Database connection configuration
        """
        self.db_config = db_config
        self.models = {}
        self.scalers = {}
        self.encoders = {}
        self.feature_names = []
        self.model_version = datetime.now().strftime('%Y%m%d_%H%M%S')
        
    def connect_db(self):
        """Establish database connection."""
        try:
            conn = psycopg2.connect(
                host=self.db_config['host'],
                port=self.db_config.get('port', 5432),
                database=self.db_config['database'],
                user=self.db_config['user'],
                password=self.db_config['password']
            )
            return conn
        except Exception as e:
            logger.error(f"Database connection failed: {str(e)}")
            raise
    
    def extract_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Extract features for fraud detection from transaction data.
        
        Args:
            df: Raw transaction dataframe
            
        Returns:
            Feature-engineered dataframe
        """
        logger.info("Extracting features from transaction data")
        
        # Time-based features
        df['hour'] = pd.to_datetime(df['transaction_time']).dt.hour
        df['day_of_week'] = pd.to_datetime(df['transaction_time']).dt.dayofweek
        df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
        df['is_night'] = df['hour'].between(22, 6).astype(int)
        
        # Transaction patterns per user
        user_stats = df.groupby('user_id').agg({
            'amount': ['mean', 'std', 'min', 'max', 'count'],
            'partner_id': 'nunique',
            'category': 'nunique'
        }).reset_index()
        user_stats.columns = ['_'.join(col).strip() for col in user_stats.columns.values]
        user_stats.rename(columns={'user_id_': 'user_id'}, inplace=True)
        
        # Partner statistics
        partner_stats = df.groupby('partner_id').agg({
            'amount': ['mean', 'std'],
            'user_id': 'nunique',
            'discount_percentage': 'mean'
        }).reset_index()
        partner_stats.columns = ['_'.join(col).strip() for col in partner_stats.columns.values]
        partner_stats.rename(columns={'partner_id_': 'partner_id'}, inplace=True)
        
        # Merge statistics
        df = df.merge(user_stats, on='user_id', how='left')
        df = df.merge(partner_stats, on='partner_id', how='left')
        
        # Velocity features (transactions in time windows)
        df['user_txn_last_hour'] = df.groupby('user_id')['transaction_time'].transform(
            lambda x: x.rolling('1H').count()
        )
        df['user_txn_last_day'] = df.groupby('user_id')['transaction_time'].transform(
            lambda x: x.rolling('24H').count()
        )
        
        # Amount deviation features
        df['amount_z_score'] = (df['amount'] - df['amount_mean']) / (df['amount_std'] + 1e-5)
        df['amount_ratio_to_avg'] = df['amount'] / (df['amount_mean'] + 1e-5)
        
        # Location features
        df['location_change'] = df.groupby('user_id')['location_id'].transform(
            lambda x: (x != x.shift()).astype(int)
        )
        
        # Device features
        df['device_change'] = df.groupby('user_id')['device_id'].transform(
            lambda x: (x != x.shift()).astype(int)
        )
        
        # Subscription features
        df['days_since_subscription'] = (
            pd.to_datetime(df['transaction_time']) - pd.to_datetime(df['subscription_start_date'])
        ).dt.days
        df['is_new_subscriber'] = (df['days_since_subscription'] < 7).astype(int)
        
        # Transaction sequence features
        df['time_since_last_txn'] = df.groupby('user_id')['transaction_time'].transform(
            lambda x: x.diff().dt.total_seconds() / 3600
        ).fillna(0)
        
        # Risk score based on multiple factors
        df['risk_score'] = (
            df['amount_z_score'].abs() * 0.3 +
            df['user_txn_last_hour'] * 0.2 +
            df['location_change'] * 0.2 +
            df['device_change'] * 0.2 +
            df['is_night'] * 0.1
        )
        
        return df
    
    def prepare_data(self) -> Tuple[pd.DataFrame, pd.Series]:
        """
        Load and prepare data for training.
        
        Returns:
            Features and labels for training
        """
        logger.info("Loading transaction data from database")
        
        conn = self.connect_db()
        
        # Query for transaction data with fraud labels
        query = """
        SELECT 
            t.id as transaction_id,
            t.user_id,
            t.partner_id,
            t.amount,
            t.discount_percentage,
            t.transaction_time,
            t.device_id,
            t.ip_address,
            t.location_id,
            p.category,
            u.subscription_start_date,
            u.subscription_type,
            COALESCE(f.is_fraud, 0) as is_fraud
        FROM transactions t
        JOIN partners p ON t.partner_id = p.id
        JOIN users u ON t.user_id = u.id
        LEFT JOIN fraud_labels f ON t.id = f.transaction_id
        WHERE t.transaction_time >= NOW() - INTERVAL '6 months'
        ORDER BY t.transaction_time
        """
        
        try:
            df = pd.read_sql(query, conn)
            logger.info(f"Loaded {len(df)} transactions")
            
            # Extract features
            df = self.extract_features(df)
            
            # Select features for modeling
            feature_columns = [
                'amount', 'discount_percentage', 'hour', 'day_of_week', 
                'is_weekend', 'is_night', 'amount_mean', 'amount_std',
                'amount_min', 'amount_max', 'amount_count', 'partner_id_nunique',
                'category_nunique', 'user_id_nunique', 'user_txn_last_hour',
                'user_txn_last_day', 'amount_z_score', 'amount_ratio_to_avg',
                'location_change', 'device_change', 'days_since_subscription',
                'is_new_subscriber', 'time_since_last_txn', 'risk_score'
            ]
            
            # Handle categorical variables
            categorical_columns = ['category', 'subscription_type']
            for col in categorical_columns:
                encoder = LabelEncoder()
                df[f'{col}_encoded'] = encoder.fit_transform(df[col].astype(str))
                self.encoders[col] = encoder
                feature_columns.append(f'{col}_encoded')
            
            self.feature_names = feature_columns
            X = df[feature_columns].fillna(0)
            y = df['is_fraud']
            
            return X, y
            
        except Exception as e:
            logger.error(f"Error preparing data: {str(e)}")
            raise
        finally:
            conn.close()
    
    def train_supervised_model(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """
        Train supervised fraud detection model.
        
        Args:
            X: Feature matrix
            y: Labels
            
        Returns:
            Trained model and metrics
        """
        logger.info("Training supervised fraud detection model")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        self.scalers['supervised'] = scaler
        
        # Handle class imbalance
        smote = SMOTE(random_state=42)
        X_train_balanced, y_train_balanced = smote.fit_resample(X_train_scaled, y_train)
        
        # Train XGBoost model
        xgb_params = {
            'n_estimators': [100, 200, 300],
            'max_depth': [3, 5, 7],
            'learning_rate': [0.01, 0.1, 0.3],
            'subsample': [0.8, 1.0],
            'colsample_bytree': [0.8, 1.0]
        }
        
        xgb_model = xgb.XGBClassifier(
            random_state=42,
            use_label_encoder=False,
            eval_metric='logloss'
        )
        
        grid_search = GridSearchCV(
            xgb_model, xgb_params, cv=5, 
            scoring='roc_auc', n_jobs=-1, verbose=1
        )
        
        grid_search.fit(X_train_balanced, y_train_balanced)
        best_model = grid_search.best_estimator_
        
        # Evaluate model
        y_pred = best_m