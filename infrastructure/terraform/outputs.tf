output "vpc_id" {
  description = "ID of the VPC"
  value       = aws_vpc.main.id
}

output "vpc_cidr_block" {
  description = "CIDR block of the VPC"
  value       = aws_vpc.main.cidr_block
}

output "public_subnet_ids" {
  description = "List of IDs of public subnets"
  value       = aws_subnet.public[*].id
}

output "private_subnet_ids" {
  description = "List of IDs of private subnets"
  value       = aws_subnet.private[*].id
}

output "database_subnet_ids" {
  description = "List of IDs of database subnets"
  value       = aws_subnet.database[*].id
}

output "nat_gateway_ids" {
  description = "List of NAT Gateway IDs"
  value       = aws_nat_gateway.main[*].id
}

output "alb_dns_name" {
  description = "DNS name of the Application Load Balancer"
  value       = aws_lb.main.dns_name
}

output "alb_zone_id" {
  description = "Zone ID of the Application Load Balancer"
  value       = aws_lb.main.zone_id
}

output "alb_arn" {
  description = "ARN of the Application Load Balancer"
  value       = aws_lb.main.arn
}

output "alb_security_group_id" {
  description = "Security group ID of the Application Load Balancer"
  value       = aws_security_group.alb.id
}

output "ecs_cluster_id" {
  description = "ID of the ECS cluster"
  value       = aws_ecs_cluster.main.id
}

output "ecs_cluster_name" {
  description = "Name of the ECS cluster"
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_names" {
  description = "Names of the ECS services"
  value = {
    api     = aws_ecs_service.api.name
    web     = aws_ecs_service.web.name
    worker  = aws_ecs_service.worker.name
  }
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = aws_db_instance.main.endpoint
}

output "rds_database_name" {
  description = "RDS database name"
  value       = aws_db_instance.main.db_name
}

output "rds_port" {
  description = "RDS instance port"
  value       = aws_db_instance.main.port
}

output "rds_security_group_id" {
  description = "Security group ID of the RDS instance"
  value       = aws_security_group.rds.id
}

output "elasticache_cluster_id" {
  description = "ElastiCache cluster ID"
  value       = aws_elasticache_cluster.redis.id
}

output "elasticache_configuration_endpoint" {
  description = "ElastiCache configuration endpoint"
  value       = aws_elasticache_cluster.redis.configuration_endpoint
}

output "elasticache_cache_nodes" {
  description = "ElastiCache node information"
  value       = aws_elasticache_cluster.redis.cache_nodes
}

output "s3_bucket_names" {
  description = "Names of S3 buckets"
  value = {
    assets     = aws_s3_bucket.assets.id
    backups    = aws_s3_bucket.backups.id
    logs       = aws_s3_bucket.logs.id
    uploads    = aws_s3_bucket.uploads.id
  }
}

output "s3_bucket_arns" {
  description = "ARNs of S3 buckets"
  value = {
    assets     = aws_s3_bucket.assets.arn
    backups    = aws_s3_bucket.backups.arn
    logs       = aws_s3_bucket.logs.arn
    uploads    = aws_s3_bucket.uploads.arn
  }
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = aws_cloudfront_distribution.main.id
}

output "cloudfront_distribution_domain_name" {
  description = "CloudFront distribution domain name"
  value       = aws_cloudfront_distribution.main.domain_name
}

output "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  value       = aws_cloudfront_distribution.main.arn
}

output "route53_zone_id" {
  description = "Route53 hosted zone ID"
  value       = aws_route53_zone.main.zone_id
}

output "route53_name_servers" {
  description = "Route53 name servers"
  value       = aws_route53_zone.main.name_servers
}

output "acm_certificate_arn" {
  description = "ACM certificate ARN"
  value       = aws_acm_certificate.main.arn
}

output "acm_certificate_domain_name" {
  description = "ACM certificate domain name"
  value       = aws_acm_certificate.main.domain_name
}

output "ses_domain_identity_arn" {
  description = "SES domain identity ARN"
  value       = aws_ses_domain_identity.main.arn
}

output "sns_topic_arns" {
  description = "SNS topic ARNs"
  value = {
    alerts        = aws_sns_topic.alerts.arn
    notifications = aws_sns_topic.notifications.arn
  }
}

output "sqs_queue_urls" {
  description = "SQS queue URLs"
  value = {
    email_queue      = aws_sqs_queue.email.url
    analytics_queue  = aws_sqs_queue.analytics.url
    webhook_queue    = aws_sqs_queue.webhook.url
  }
}

output "lambda_function_names" {
  description = "Lambda function names"
  value = {
    image_processor  = aws_lambda_function.image_processor.function_name
    email_sender     = aws_lambda_function.email_sender.function_name
    data_exporter    = aws_lambda_function.data_exporter.function_name
  }
}

output "ecr_repository_urls" {
  description = "ECR repository URLs"
  value = {
    api     = aws_ecr_repository.api.repository_url
    web     = aws_ecr_repository.web.repository_url
    worker  = aws_ecr_repository.worker.repository_url
  }
}

output "waf_web_acl_id" {
  description = "WAF Web ACL ID"
  value       = aws_wafv2_web_acl.main.id
}

output "waf_web_acl_arn" {
  description = "WAF Web ACL ARN"
  value       = aws_wafv2_web_acl.main.arn
}

output "secrets_manager_secret_arns" {
  description = "Secrets Manager secret ARNs"
  value = {
    database     = aws_secretsmanager_secret.database.arn
    api_keys     = aws_secretsmanager_secret.api_keys.arn
    jwt_secret   = aws_secretsmanager_secret.jwt.arn
  }
}

output "cloudwatch_log_group_names" {
  description = "CloudWatch log group names"
  value = {
    ecs_api     = aws_cloudwatch_log_group.ecs_api.name
    ecs_web     = aws_cloudwatch_log_group.ecs_web.name
    ecs_worker  = aws_cloudwatch_log_group.ecs_worker.name
    lambda      = aws_cloudwatch_log_group.lambda.name
  }
}

output "iam_role_arns" {
  description = "IAM role ARNs"
  value = {
    ecs_task_execution = aws_iam_role.ecs_task_execution.arn
    ecs_task           = aws_iam_role.ecs_task.arn
    lambda_execution   = aws_iam_role.lambda_execution.arn
  }
}

output "api_gateway_url" {
  description = "API Gateway URL"
  value       = aws_api_gateway_deployment.main.invoke_url
}

output "cognito_user_pool_id" {
  description = "Cognito User Pool ID"
  value       = aws_cognito_user_pool.main.id
}

output "cognito_user_pool_client_id" {
  description = "Cognito User Pool Client ID"
  value       = aws_cognito_user_pool_client.main.id
}

output "cognito_identity_pool_id" {
  description = "Cognito Identity Pool ID"
  value       = aws_cognito_identity_pool.main.id
}

output "dynamodb_table_names" {
  description = "DynamoDB table names"
  value = {
    sessions     = aws_dynamodb_table.sessions.name
    audit_logs   = aws_dynamodb_table.audit_logs.name
    cache        = aws_dynamodb_table.cache.name
  }
}

output "environment" {
  description = "Environment name"
  value       = var.environment
}

output "region" {
  description = "AWS region"
  value       = var.region
}

output "project_name" {
  description = "Project name"
  value       = var.project_name
}

output "tags" {
  description = "Resource tags"
  value       = var.tags
}
