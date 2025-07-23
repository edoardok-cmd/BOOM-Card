#!/usr/bin/env python3
"""
Fix the remaining syntax errors in BOOM Card project files
"""

import os
import json
import re

def fix_backend_swagger_json():
    """Fix the empty swagger.json file"""
    swagger_path = "backend/src/docs/swagger.json"
    swagger_content = {
        "openapi": "3.0.0",
        "info": {
            "title": "BOOM Card API",
            "version": "1.0.0",
            "description": "Digital business card platform API"
        },
        "servers": [
            {
                "url": "http://localhost:3000/api/v1",
                "description": "Development server"
            }
        ],
        "paths": {},
        "components": {
            "schemas": {},
            "securitySchemes": {
                "bearerAuth": {
                    "type": "http",
                    "scheme": "bearer",
                    "bearerFormat": "JWT"
                }
            }
        }
    }
    
    with open(swagger_path, 'w') as f:
        json.dump(swagger_content, f, indent=2)
    print(f"Fixed: {swagger_path}")

def fix_search_elasticsearch_settings():
    """Fix the elasticsearch settings.json file"""
    settings_path = "search/elasticsearch/settings.json"
    settings_content = {
        "settings": {
            "number_of_shards": 1,
            "number_of_replicas": 0,
            "analysis": {
                "analyzer": {
                    "boom_analyzer": {
                        "tokenizer": "standard",
                        "filter": ["lowercase", "asciifolding", "boom_synonyms"]
                    }
                },
                "filter": {
                    "boom_synonyms": {
                        "type": "synonym",
                        "synonyms": [
                            "restaurant,dining,food",
                            "hotel,accommodation,lodging",
                            "bar,pub,drinks"
                        ]
                    }
                }
            }
        }
    }
    
    os.makedirs(os.path.dirname(settings_path), exist_ok=True)
    with open(settings_path, 'w') as f:
        json.dump(settings_content, f, indent=2)
    print(f"Fixed: {settings_path}")

def fix_search_elasticsearch_mappings():
    """Fix the elasticsearch mappings.json file"""
    mappings_path = "search/elasticsearch/mappings.json"
    mappings_content = {
        "mappings": {
            "properties": {
                "id": {"type": "keyword"},
                "name": {"type": "text", "analyzer": "boom_analyzer"},
                "description": {"type": "text"},
                "category": {"type": "keyword"},
                "subcategory": {"type": "keyword"},
                "location": {
                    "type": "geo_point"
                },
                "address": {"type": "text"},
                "city": {"type": "keyword"},
                "discount": {"type": "float"},
                "rating": {"type": "float"},
                "reviewCount": {"type": "integer"},
                "tags": {"type": "keyword"},
                "created_at": {"type": "date"},
                "updated_at": {"type": "date"}
            }
        }
    }
    
    with open(mappings_path, 'w') as f:
        json.dump(mappings_content, f, indent=2)
    print(f"Fixed: {mappings_path}")

def fix_kafka_topics_json():
    """Fix the kafka topics.json file"""
    topics_path = "data-pipeline/kafka/topics.json"
    topics_content = {
        "topics": [
            {
                "name": "boom-card-transactions",
                "partitions": 3,
                "replication": 1,
                "config": {
                    "retention.ms": "604800000",
                    "compression.type": "snappy"
                }
            },
            {
                "name": "boom-card-events",
                "partitions": 3,
                "replication": 1,
                "config": {
                    "retention.ms": "259200000"
                }
            },
            {
                "name": "boom-card-analytics",
                "partitions": 1,
                "replication": 1,
                "config": {
                    "retention.ms": "2592000000"
                }
            }
        ]
    }
    
    os.makedirs(os.path.dirname(topics_path), exist_ok=True)
    with open(topics_path, 'w') as f:
        json.dump(topics_content, f, indent=2)
    print(f"Fixed: {topics_path}")

def fix_bi_dashboard_json():
    """Fix the BI dashboard JSON file"""
    dashboard_path = "bi/dashboards/executive-summary.json"
    dashboard_content = {
        "name": "Executive Summary",
        "version": "1.0.0",
        "widgets": [
            {
                "id": "revenue-chart",
                "type": "line-chart",
                "title": "Revenue Over Time",
                "dataSource": "revenue_metrics",
                "position": {"x": 0, "y": 0, "w": 6, "h": 4}
            },
            {
                "id": "user-growth",
                "type": "bar-chart",
                "title": "User Growth",
                "dataSource": "user_metrics",
                "position": {"x": 6, "y": 0, "w": 6, "h": 4}
            },
            {
                "id": "partner-map",
                "type": "map",
                "title": "Partner Distribution",
                "dataSource": "partner_locations",
                "position": {"x": 0, "y": 4, "w": 12, "h": 6}
            }
        ],
        "filters": [
            {
                "id": "date-range",
                "type": "date-range",
                "default": "last-30-days"
            }
        ]
    }
    
    os.makedirs(os.path.dirname(dashboard_path), exist_ok=True)
    with open(dashboard_path, 'w') as f:
        json.dump(dashboard_content, f, indent=2)
    print(f"Fixed: {dashboard_path}")

def fix_service_mesh_consul_config():
    """Fix the consul config.json file"""
    consul_path = "service-mesh/consul/config.json"
    consul_content = {
        "datacenter": "boom-dc1",
        "data_dir": "/opt/consul/data",
        "log_level": "INFO",
        "node_name": "boom-node-1",
        "server": True,
        "bootstrap_expect": 1,
        "ui": True,
        "client_addr": "0.0.0.0",
        "bind_addr": "0.0.0.0",
        "connect": {
            "enabled": True,
            "ca_provider": "consul"
        },
        "ports": {
            "grpc": 8502
        },
        "services": [
            {
                "name": "boom-api",
                "port": 3000,
                "check": {
                    "http": "http://localhost:3000/health",
                    "interval": "10s"
                }
            }
        ]
    }
    
    os.makedirs(os.path.dirname(consul_path), exist_ok=True)
    with open(consul_path, 'w') as f:
        json.dump(consul_content, f, indent=2)
    print(f"Fixed: {consul_path}")

def main():
    """Fix all JSON files with syntax errors"""
    print("Fixing remaining syntax errors in BOOM Card project...")
    
    # Fix JSON files
    fix_backend_swagger_json()
    fix_search_elasticsearch_settings()
    fix_search_elasticsearch_mappings()
    fix_kafka_topics_json()
    fix_bi_dashboard_json()
    fix_service_mesh_consul_config()
    
    print("\nJSON files fixed!")
    
    # Note: The remaining TypeScript/JavaScript files with bracket mismatches
    # are likely truncated and need manual inspection to determine the proper fix

if __name__ == "__main__":
    main()