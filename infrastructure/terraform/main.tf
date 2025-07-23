# Main Terraform configuration for BOOM Card Platform

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
  
  backend "s3" {
    # Backend configuration should be provided via backend config file or CLI flags
    # bucket         = "boom-card-terraform-state"
    # key            = "infrastructure/terraform.tfstate"
    # region         = "eu-central-1"
    # dynamodb_table = "boom-card-terraform-locks"
    # encrypt        = true
  }
}

# Provider configuration
provider "aws" {
  region = var.aws_region
  
  default_tags {
    tags = {
      Project     = "BOOM-Card"
      Environment = var.environment
      ManagedBy   = "Terraform"
      CostCenter  = var.cost_center
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  state = "available"
}

data "aws_caller_identity" "current" {}

# Random suffix for unique resource names
resource "random_string" "suffix" {
  length  = 8
  special = false
  upper   = false
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"
  
  project_name         = var.project_name
  environment          = var.environment
  vpc_cidr            = var.vpc_cidr
  availability_zones   = data.aws_availability_zones.available.names
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  database_subnet_cidrs = var.database_subnet_cidrs
  enable_nat_gateway   = var.enable_nat_gateway
  single_nat_gateway   = var.single_nat_gateway
  enable_vpn_gateway   = var.enable_vpn_gateway
  
  tags = local.common_tags
}

# Security Module
module "security" {
  source = "./modules/security"
  
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
  vpc_cidr     = var.vpc_cidr
  
  # ALB security group rules
  alb_ingress_rules = [
    {
      from_port   = 80
      to_port     = 80
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTP from anywhere"
    },
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
      description = "HTTPS from anywhere"
    }
  ]
  
  tags = local.common_tags
}

# RDS Module for PostgreSQL
module "rds" {
  source = "./modules/rds"
  
  project_name                = var.project_name
  environment                 = var.environment
  db_instance_class          = var.db_instance_class
  db_allocated_storage       = var.db_allocated_storage
  db_max_allocated_storage   = var.db_max_allocated_storage
  db_engine_version          = var.db_engine_version
  db_name                    = var.db_name
  db_username                = var.db_username
  db_subnet_group_name       = module.vpc.database_subnet_group_name
  vpc_security_group_ids     = [module.security.rds_security_group_id]
  backup_retention_period    = var.db_backup_retention_period
  backup_window              = var.db_backup_window
  maintenance_window         = var.db_maintenance_window
  skip_final_snapshot        = var.environment != "production"
  deletion_protection        = var.environment == "production"
  enabled_cloudwatch_logs_exports = ["postgresql"]
  
  tags = local.common_tags
}

# ElastiCache Module for Redis
module "elasticache" {
  source = "./modules/elasticache"
  
  project_name              = var.project_name
  environment               = var.environment
  node_type                 = var.redis_node_type
  num_cache_nodes          = var.redis_num_cache_nodes
  parameter_group_family    = var.redis_parameter_group_family
  engine_version           = var.redis_engine_version
  subnet_ids               = module.vpc.private_subnet_ids
  security_group_ids       = [module.security.redis_security_group_id]
  snapshot_retention_limit = var.redis_snapshot_retention_limit
  snapshot_window          = var.redis_snapshot_window
  
  tags = local.common_tags
}

# S3 Module for static assets and backups
module "s3" {
  source = "./modules/s3"
  
  project_name = var.project_name
  environment  = var.environment
  
  buckets = {
    static_assets = {
      versioning = true
      lifecycle_rules = [{
        id      = "expire_old_versions"
        enabled = true
        noncurrent_version_expiration_days = 90
      }]
    }
    user_uploads = {
      versioning = true
      cors_rules = [{
        allowed_headers = ["*"]
        allowed_methods = ["GET", "PUT", "POST"]
        allowed_origins = var.allowed_origins
        expose_headers  = ["ETag"]
        max_age_seconds = 3000
      }]
    }
    backups = {
      versioning = true
      lifecycle_rules = [{
        id      = "archive_old_backups"
        enabled = true
        transition_glacier_days = 30
        expiration_days = 365
      }]
    }
  }
  
  tags = local.common_tags
}

# ECS Cluster Module
module "ecs" {
  source = "./modules/ecs"
  
  project_name = var.project_name
  environment  = var.environment
  
  enable_container_insights = var.environment == "production"
  capacity_providers       = ["FARGATE", "FARGATE_SPOT"]
  
  default_capacity_provider_strategy = [
    {
      capacity_provider = "FARGATE"
      weight           = 1
      base             = 1
    },
    {
      capacity_provider = "FARGATE_SPOT"
      weight           = 4
      base             = 0
    }
  ]
  
  tags = local.common_tags
}

# ALB Module
module "alb" {
  source = "./modules/alb"
  
  project_name         = var.project_name
  environment          = var.environment
  vpc_id              = module.vpc.vpc_id
  subnet_ids          = module.vpc.public_subnet_ids
  security_group_ids   = [module.security.alb_security_group_id]
  certificate_arn     = var.certificate_arn
  enable_deletion_protection = var.environment == "production"
  enable_http2        = true
  idle_timeout        = 60
  
  access_logs = {
    enabled = true
    bucket  = module.s3.bucket_ids["logs"]
    prefix  = "alb"
  }
  
  tags = local.common_tags
}

# ECS Services
module "ecs_services" {
  source = "./modules/ecs-services"
  
  project_name     = var.project_name
  environment      = var.environment
  cluster_id       = module.ecs.cluster_id
  vpc_id          = module.vpc.vpc_id
  private_subnets  = module.vpc.private_subnet_ids
  alb_target_group_arns = module.alb.target_group_arns
  
  # Service configurations
  services = {
    api = {
      cpu                = var.api_service_cpu
      memory             = var.api_service_memory
      desired_count      = var.api_service_desired_count
      container_port     = 3000
      health_check_grace_period = 60
      
      environment_variables = {
        NODE_ENV           = var.environment
        DATABASE_URL       = module.rds.connection_string
        REDIS_URL         = module.elasticache.connection_string
        AWS_REGION        = var.aws_region
        S3_BUCKET_UPLOADS = module.s3.bucket_ids["user_uploads"]
      }
      
      autoscaling = {
        min_capacity = var.environment == "production" ? 2 : 1
        max_capacity = var.environment == "production" ? 10 : 3
        
        target_tracking_scaling_policies = [
          {
            policy_name        = "cpu-utilization"
            target_value       = 70
            predefined_metric_type = "ECSServiceAverageCPUUtilization"
          },
          {
            policy_name        = "memory-utilization"
            target_value       = 80
            predefined_metric_type = "ECSServiceAverageMemoryUtilization"
          }
        ]
      }
    }
    
    web = {
      cpu                = var.web_service_cpu
      memory             = var.web_service_memory
      desired_count      = var.web_service_desired_count
      container_port     = 3000
      health_check_grace_period = 60
      
      environment_variables = {
        NEXT_PUBLIC_API_URL = "https://${var.api_domain}"
        NODE_ENV           = var.environment
      }
      
      autoscaling = {
        min_capacity = var.environment == "production" ? 2 : 1
        max_capacity = var.environment == "production" ? 8 : 2
        
        target_tracking_scaling_policies = [
          {
            policy_name        = "cpu-utilization"
            target_value       = 70
            predefined_metric_type = "ECSServiceAverageCPUUtilization"
          }
        ]
      }
    }
    
    worker = {
      cpu                = var.worker_service_cpu
      memory             = var.worker_service_memory
      desired_count      = var.worker_service_desired_count
      container_port     = null  # Worker doesn't expose ports
      
      environment_variables = {
        NODE_ENV           = var.environment
        DATABASE_URL       = module.rds.connection_string
        REDIS_URL         = module.elasticache.connection_string
        AWS_REGION        = var.aws_region
        S3_BUCKET_UPLOADS = module.s3.bucket_ids["user_uploads"]
      }
      
      autoscaling = {
        min_capacity = 1
        max_capacity = var.environment == "production" ? 5 : 2
        
        target_tracking_scaling_policies = [
          {
            policy_name        = "cpu-utilization"
            target_value       = 80
            predefined_metric_type = "ECSServiceAverageCPUUtilization"
          }
        ]
      }
    }
  }
  
  task_role_policy_arns = [
    "arn:aws:iam::aws:policy/AmazonS3FullAccess",
    "arn:aws:iam::aws:policy/AmazonSESFullAccess",
    "arn:aws:iam::aws:policy/CloudWatchLogsFullAccess"
  ]
  
  security_group_ids = {
    api    = [module.security.ecs_service_security_group_id]
    web    = [module.security.ecs_service_security_group_id]
    worker = [module.security.ecs_service_security_group_id]
  }
  
  tags = local.common_tags
}

# CloudFront Module
module "cloudfront" {
  source = "./modules/cloudfront"
  
  project_name     = var.project_name
  environment      = var.environment
  domain_names     = [var.domain_name, "www.${var.domain_name}"]
  certificate_arn  = var.cloudfront_certificate_arn
  
  # Origin configurations
  origins = {
    web = {
      domain_name = module.alb.dns_name
      origin_id   = "alb-web"
      custom_origin_config = {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "https-only"
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
    
    api = {
      domain_name = module.alb.dns_name
      origin_id   = "alb-api"
      origin_path = "/api"
      custom_origin_config = {
        http_port              = 80
        https_port             = 443
        origin_protocol_policy = "https-only"
        origin_ssl_protocols   = ["TLSv1.2"]
      }
    }
    
    static = {
      domain_name = module.s3.bucket_regional_domain_names["static_assets"]
      origin_id   = "s3-static"
      s3_origin_config = {
        origin_access_identity = module.cloudfront.origin_access_identity
      }
    }
  }
  
  # Cache behaviors
  default_cache_behavior = {
    target_origin_id       = "alb-web"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    compress               = true
    
    forwarded_values = {
      query_string = true
      headers      = ["Host", "Origin", "Access-Control-Request-Method", "Access-Control-Request-Headers"]
      cookies = {
        forward = "all"
      }
    }
  }
  
  ordered_cache_behaviors = [
    {
      path_pattern           = "/api/*"
      target_origin_id       = "alb-api"
      viewer_protocol_policy = "redirect-to-https"
      allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
      cached_methods         = ["GET", "HEAD"]
      compress               = true
      
      forwarded_values = {
        query_string = true
        headers      = ["*"]
        cookies = {
          forward = "all"
        }
 