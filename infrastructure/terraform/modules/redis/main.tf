```hcl
# Redis Cluster Configuration for BOOM Card Platform
# Provides high-availability caching layer for session management, API responses, and real-time data

# Subnet Group for ElastiCache
resource "aws_elasticache_subnet_group" "redis" {
  name       = "${var.project_name}-${var.environment}-redis-subnet-group"
  subnet_ids = var.subnet_ids

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-subnet-group"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

# Parameter Group for Redis optimization
resource "aws_elasticache_parameter_group" "redis" {
  family = var.redis_family
  name   = "${var.project_name}-${var.environment}-redis-params"

  # Performance optimizations
  parameter {
    name  = "maxmemory-policy"
    value = "allkeys-lru"
  }

  parameter {
    name  = "timeout"
    value = "300"
  }

  parameter {
    name  = "tcp-keepalive"
    value = "60"
  }

  parameter {
    name  = "maxclients"
    value = "65000"
  }

  # Enable Redis persistence for critical data
  parameter {
    name  = "save"
    value = var.enable_persistence ? "900 1 300 10 60 10000" : ""
  }

  parameter {
    name  = "appendonly"
    value = var.enable_persistence ? "yes" : "no"
  }

  parameter {
    name  = "appendfsync"
    value = "everysec"
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-params"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

# Security Group for Redis
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-${var.environment}-redis-sg"
  description = "Security group for Redis cluster"
  vpc_id      = var.vpc_id

  # Allow inbound Redis connections from application security groups
  dynamic "ingress" {
    for_each = var.allowed_security_group_ids
    content {
      from_port       = 6379
      to_port         = 6379
      protocol        = "tcp"
      security_groups = [ingress.value]
      description     = "Redis access from application layer"
    }
  }

  # Allow all outbound traffic
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-sg"
      Component   = "Redis"
      Environment = var.environment
    }
  )

  lifecycle {
    create_before_destroy = true
  }
}

# Redis Replication Group (Cluster Mode Disabled for simplicity)
resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "${var.project_name}-${var.environment}-redis"
  replication_group_description = "Redis cluster for ${var.project_name} ${var.environment}"
  
  engine                     = "redis"
  engine_version            = var.redis_version
  node_type                 = var.node_type
  number_cache_clusters     = var.number_cache_clusters
  port                      = 6379
  
  parameter_group_name      = aws_elasticache_parameter_group.redis.name
  subnet_group_name         = aws_elasticache_subnet_group.redis.name
  security_group_ids        = [aws_security_group.redis.id]
  
  # High availability settings
  automatic_failover_enabled = var.automatic_failover_enabled
  multi_az_enabled          = var.multi_az_enabled
  
  # Backup and maintenance settings
  at_rest_encryption_enabled = true
  transit_encryption_enabled = var.transit_encryption_enabled
  auth_token_enabled        = var.auth_token_enabled
  auth_token                = var.auth_token_enabled ? var.auth_token : null
  
  snapshot_retention_limit   = var.snapshot_retention_limit
  snapshot_window           = var.snapshot_window
  maintenance_window        = var.maintenance_window
  
  # Notification settings
  notification_topic_arn    = var.notification_topic_arn
  
  # Auto minor version upgrade
  auto_minor_version_upgrade = var.auto_minor_version_upgrade
  
  # Logging
  log_delivery_configuration {
    destination      = var.slow_log_destination
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "slow-log"
  }
  
  log_delivery_configuration {
    destination      = var.engine_log_destination
    destination_type = "cloudwatch-logs"
    log_format       = "json"
    log_type         = "engine-log"
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis"
      Component   = "Redis"
      Environment = var.environment
      Purpose     = "Caching layer for session management and API responses"
    }
  )

  lifecycle {
    prevent_destroy = true
  }
}

# CloudWatch Alarms for Redis monitoring
resource "aws_cloudwatch_metric_alarm" "redis_cpu" {
  alarm_name          = "${var.project_name}-${var.environment}-redis-cpu-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = var.cpu_threshold
  alarm_description   = "Redis cluster CPU utilization"
  alarm_actions       = var.alarm_actions

  dimensions = {
    CacheClusterId = aws_elasticache_replication_group.redis.id
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-cpu-alarm"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "redis_memory" {
  alarm_name          = "${var.project_name}-${var.environment}-redis-memory-utilization"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseMemoryUsagePercentage"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = var.memory_threshold
  alarm_description   = "Redis cluster memory utilization"
  alarm_actions       = var.alarm_actions

  dimensions = {
    CacheClusterId = aws_elasticache_replication_group.redis.id
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-memory-alarm"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "redis_evictions" {
  alarm_name          = "${var.project_name}-${var.environment}-redis-evictions"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "Evictions"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Sum"
  threshold           = var.evictions_threshold
  alarm_description   = "Redis cluster evictions rate"
  alarm_actions       = var.alarm_actions

  dimensions = {
    CacheClusterId = aws_elasticache_replication_group.redis.id
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-evictions-alarm"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

resource "aws_cloudwatch_metric_alarm" "redis_connections" {
  alarm_name          = "${var.project_name}-${var.environment}-redis-connections"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CurrConnections"
  namespace           = "AWS/ElastiCache"
  period              = "300"
  statistic           = "Average"
  threshold           = var.connections_threshold
  alarm_description   = "Redis cluster current connections"
  alarm_actions       = var.alarm_actions

  dimensions = {
    CacheClusterId = aws_elasticache_replication_group.redis.id
  }

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-connections-alarm"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

# SSM Parameters for Redis connection details
resource "aws_ssm_parameter" "redis_endpoint" {
  name  = "/${var.project_name}/${var.environment}/redis/endpoint"
  type  = "SecureString"
  value = aws_elasticache_replication_group.redis.primary_endpoint_address

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-endpoint"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

resource "aws_ssm_parameter" "redis_port" {
  name  = "/${var.project_name}/${var.environment}/redis/port"
  type  = "String"
  value = "6379"

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-port"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

resource "aws_ssm_parameter" "redis_auth_token" {
  count = var.auth_token_enabled ? 1 : 0
  
  name  = "/${var.project_name}/${var.environment}/redis/auth_token"
  type  = "SecureString"
  value = var.auth_token

  tags = merge(
    var.common_tags,
    {
      Name        = "${var.project_name}-${var.environment}-redis-auth-token"
      Component   = "Redis"
      Environment = var.environment
    }
  )
}

# Outputs
output "redis_endpoint" {
  description = "Redis primary endpoint address"
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "redis_configuration_endpoint" {
  description = "Redis configuration endpoint for cluster mode"
  value       = aws_elasticache_replication_group.redis.configuration_endpoint_address
}

output "redis_port" {
  description = "Redis port"
  value       = 6379
}

output "redis_security_group_id" {
  description = "Security group ID for Redis"
  value       = aws_security_group.redis.id
}

output "redis_parameter_group_name" {
  description = "Redis parameter group name"
  value       = aws_elasticache_parameter_group.redis.name
}

output "redis_subnet_group_name" {
  description = "Redis subnet group name"
  value       = aws_elasticache_subnet_