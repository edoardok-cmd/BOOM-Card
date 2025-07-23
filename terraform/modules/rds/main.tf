terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0" # Specify a compatible AWS provider version
    }
  }
  required_version = ">= 1.0"
}

# -----------------------------------------------------------------------------
# INPUT VARIABLES
# -----------------------------------------------------------------------------

variable "environment" {
  description = "The deployment environment (e.g., 'production', 'staging', 'development'). Used for naming and conditional settings."
  type        = string
  default     = "development" # Default to development for safer initial deployments
}

variable "project_name" {
  description = "The name of the project, used for resource tagging."
  type        = string
  default     = "BOOMCard"
}

variable "db_identifier_prefix" {
  description = "Prefix for the DB instance identifier. The full identifier will be <prefix>-<environment>."
  type        = string
  default     = "boomcard-db"
}

variable "db_name" {
  description = "The name of the database to create within the RDS instance."
  type        = string
  default     = "boomcard_db"
}

variable "db_username" {
  description = "Master username for the database. IMPORTANT: Avoid hardcoding for production."
  type        = string
  default     = "boomadmin"
}

variable "db_password_secret_arn" {
  description = "ARN of the AWS Secrets Manager secret storing the database master password. If provided, `db_password` will be ignored."
  type        = string
  default     = null
}

variable "db_password" {
  description = "Master password for the database. IMPORTANT: For production, strongly consider using `db_password_secret_arn` or allow Terraform to generate one and retrieve it securely."
  type        = string
  sensitive   = true
  default     = null # Default to null to encourage using a secret ARN or random generation
}

variable "instance_class" {
  description = "The instance type of the RDS instance (e.g., 'db.t3.medium', 'db.m5.large')."
  type        = string
  default     = "db.t3.medium" # A good balance for development/staging. Adjust for production scale.
}

variable "allocated_storage" {
  description = "The allocated storage in GiB for the DB instance."
  type        = number
  default     = 50 # Start with 50GB
}

variable "max_allocated_storage" {
  description = "The upper limit (in GiB) to which Amazon RDS can automatically scale the storage of the DB instance."
  type        = number
  default     = 100 # Allow up to 100GB auto-scaling
}

variable "engine" {
  description = "The database engine to use (e.g., 'postgres')."
  type        = string
  default     = "postgres"
}

variable "engine_version" {
  description = "The engine version to use (e.g., '15.5')."
  type        = string
  default     = "15.5" # Use a recent stable PostgreSQL version
}

variable "multi_az" {
  description = "Specifies if the DB instance is Multi-AZ for high availability. Defaults to false for dev, true for production."
  type        = bool
  default     = false
}

variable "publicly_accessible" {
  description = "Specifies whether the DB instance is publicly accessible. Should always be 'false' for production."
  type        = bool
  default     = false
}

variable "vpc_security_group_ids" {
  description = "A list of VPC security group IDs to associate with the DB instance."
  type        = list(string)
  # This variable should be explicitly provided by the calling module for network security.
}

variable "db_subnet_group_name" {
  description = "The name of the DB subnet group to associate with the DB instance. This group defines the subnets where the RDS instance will be deployed."
  type        = string
  # This variable should be explicitly provided by the calling module.
}

variable "backup_retention_period" {
  description = "The number of days for which automated backups are retained. Production environments should have a retention period of at least 7 days."
  type        = number
  default     = 7
}

variable "skip_final_snapshot" {
  description = "Determines whether a final DB snapshot is created before the DB instance is deleted. Defaults to 'true' for dev/staging for faster deletion, 'false' for production."
  type        = bool
  default     = true
}

variable "deletion_protection" {
  description = "Specifies whether the DB instance should have deletion protection enabled. Defaults to 'false' for dev/staging, 'true' for production."
  type        = bool
  default     = false
}

variable "apply_immediately" {
  description = "Specifies whether any modifications to the DB instance are applied immediately, or during the next maintenance window. Defaults to 'false' for safer changes."
  type        = bool
  default     = false
}

variable "parameter_group_name" {
  description = "The name of an existing DB parameter group to associate with the DB instance. If null, a new parameter group will be created by this module."
  type        = string
  default     = null
}

variable "monitoring_interval" {
  description = "The interval, in seconds, for enhanced monitoring to be enabled. Set to 0 to disable."
  type        = number
  default     = 60 # Enable enhanced monitoring every 60 seconds
}

variable "performance_insights_enabled" {
  description = "Specifies whether Performance Insights are enabled for the DB instance."
  type        = bool
  default     = true
}

variable "performance_insights_retention_period" {
  description = "The amount of time in days that Performance Insights data is retained. 7 days is included in the free tier; up to 731 days (2 years) can be configured."
  type        = number
  default     = 7
}

variable "kms_key_id" {
  description = "The ARN of the KMS key for encryption. If null, AWS managed key for RDS will be used."
  type        = string
  default     = null
}

# -----------------------------------------------------------------------------
# LOCALS
# -----------------------------------------------------------------------------
locals {
  db_identifier = "${var.db_identifier_prefix}-${var.environment}"
  is_production = var.environment == "production"

  # Conditional settings based on environment for production readiness
  final_snapshot_skip_value = local.is_production ? false : var.skip_final_snapshot
  deletion_protection_value = local.is_production ? true : var.deletion_protection
  multi_az_value            = local.is_production ? true : var.multi_az

  # Determine the master password source: Secrets Manager > Explicit Variable > Random Generation
  db_master_password = var.db_password_secret_arn != null ? (
    data.aws_secretsmanager_secret_version.db_password[0].secret_string
  ) : (
    var.db_password != null ? var.db_password : random_password.master_password[0].result
  )
}

# -----------------------------------------------------------------------------
# DATA SOURCES & HELPER RESOURCES
# -----------------------------------------------------------------------------

# Data source for retrieving password from Secrets Manager if ARN is provided
# This is a secure way to manage sensitive credentials.
data "aws_secretsmanager_secret_version" "db_password" {
  count     = var.db_password_secret_arn != null ? 1 : 0
  secret_id = var.db_password_secret_arn
}

# Generates a random strong password if no explicit password or secret ARN is provided.
# Useful for initial deployments or development environments where Secrets Manager isn't yet configured.
resource "random_password" "master_password" {
  count = var.db_password_secret_arn == null && var.db_password == null ? 1 : 0
  length           = 16
  special          = true
  override_special = "!@#$%^&*()" # Define specific special characters allowed
  min_upper        = 1
  min_lower        = 1
  min_numeric      = 1
}

# -----------------------------------------------------------------------------
# RDS PARAMETER GROUP
# -----------------------------------------------------------------------------

# Creates a custom PostgreSQL parameter group if `parameter_group_name` is not provided.
# This allows for fine-tuning database parameters beyond the default settings.
resource "aws_db_parameter_group" "boomcard_postgres" {
  count       = var.parameter_group_name == null ? 1 : 0
  name        = "${local.db_identifier}-pg-params"
  family      = "${var.engine}${split(".", var.engine_version)[0]}" # e.g., postgres15 for engine_version 15.x
  description = "Custom parameter group for BOOMCard PostgreSQL DB instance"

  # Common PostgreSQL parameters for logging and connection management
  parameter {
    name  = "log_connections"
    value = "1" # Logs successful connections
  }

  parameter {
    name  = "log_disconnections"
    value = "1" # Logs disconnections
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000" # Logs all statements that take longer than 1000ms (1 second) to execute
  }

  parameter {
    name  = "max_connections"
    value = "200" # Default value, adjust based on expected load and instance class
  }

  parameter {
    name  = "idle_in_transaction_session_timeout"
    value = "60000" # Terminates sessions that have been idle in a transaction for 60 seconds (60000 ms)
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Name        = "${local.db_identifier}-pg-params"
  }
}

# -----------------------------------------------------------------------------
# RDS INSTANCE
# -----------------------------------------------------------------------------

resource "aws_db_instance" "boomcard_rds" {
  identifier                = local.db_identifier
  engine                    = var.engine
  engine_version            = var.engine_version
  instance_class            = var.instance_class
  allocated_storage         = var.allocated_storage
  max_allocated_storage     = var.max_allocated_storage
  storage_type              = "gp2" # General Purpose SSD (gp2) for balanced performance
  storage_encrypted         = true
  kms_key_id                = var.kms_key_id # If null, uses default AWS managed KMS key for RDS

  name                      = var.db_name
  username                  = var.db_username
  password                  = local.db_master_password # Dynamically selects password source

  multi_az                  = local.multi_az_value            # High availability for production
  publicly_accessible       = var.publicly_accessible       # Should be 'false' for secure deployments
  vpc_security_group_ids    = var.vpc_security_group_ids    # Network access control
  db_subnet_group_name      = var.db_subnet_group_name      # Subnet placement for private network access
  
  port                      = 5432 # Default PostgreSQL port

  # Backup and Maintenance configuration for data durability and system stability
  backup_retention_period   = var.backup_retention_period
  skip_final_snapshot       = local.final_snapshot_skip_value # Controlled by environment variable
  deletion_protection       = local.deletion_protection_value # Controlled by environment variable
  apply_immediately         = var.apply_immediately           # Immediate vs. maintenance window apply

  # Enhanced Monitoring and Performance Insights for operational visibility
  monitoring_interval              = var.monitoring_interval
  performance_insights_enabled     = var.performance_insights_enabled
  performance_insights_retention_period = var.performance_insights_retention_period

  # Associates with a custom parameter group or the one created by this module
  parameter_group_name = var.parameter_group_name != null ? var.parameter_group_name : aws_db_parameter_group.boomcard_postgres[0].name

  # Enable automatic minor version upgrades for security patches and bug fixes
  auto_minor_version_upgrade = true
  
  # Tags for identification, cost allocation, and resource management
  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
    Name        = local.db_identifier
  }
}

# -----------------------------------------------------------------------------
# OUTPUTS
# -----------------------------------------------------------------------------

output "db_instance_endpoint" {
  description = "The connection endpoint (address) for the RDS instance."
  value       = aws_db_instance.boomcard_rds.address
}

output "db_instance_port" {
  description = "The port for the RDS instance."
  value       = aws_db_instance.boomcard_rds.port
}

output "db_instance_arn" {
  description = "The Amazon Resource Name (ARN) of the RDS instance."
  value       = aws_db_instance.boomcard_rds.arn
}

output "db_instance_id" {
  description = "The unique identifier of the RDS instance."
  value       = aws_db_instance.boomcard_rds.id
}

output "db_instance_status" {
  description = "The current status of the RDS instance (e.g., 'available')."
  value       = aws_db_instance.boomcard_rds.status
}

output "db_instance_parameter_group_name" {
  description = "The name of the parameter group associated with the RDS instance."
  value       = aws_db_instance.boomcard_rds.parameter_group_name
}

output "db_generated_password_warning" {
  description = "Important: If no explicit 'db_password' or 'db_password_secret_arn' was provided, a random password was generated. You must retrieve this securely from the 'db_generated_password' output (if available) and store it in a secrets manager immediately after creation for future access and rotation."
  value       = var.db_password_secret_arn == null && var.db_password == null ? "A random master password has been generated for the RDS instance. Please retrieve it from 'db_generated_password' output and store it securely." : "Master password was provided explicitly or retrieved from AWS Secrets Manager."
}

output "db_generated_password" {
  description = "The randomly generated master password for the RDS instance (only populated if no explicit password or secret ARN was provided)."
  value       = var.db_password_secret_arn == null && var.db_password == null ? random_password.master_password[0].result : "N/A"
  sensitive   = true # Mark as sensitive to prevent plain-text output in logs
}