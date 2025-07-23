# terraform/modules/ecs/main.tf

# This Terraform module provisions the Amazon Elastic Container Service (ECS) infrastructure
# for the BOOM Card platform. It includes the ECS cluster, task definitions,
# ECS services, IAM roles for task execution and task permissions, CloudWatch Log Groups,
# and Application Load Balancer (ALB) with listeners and rules for public-facing services.

# --- Variables ---
# These variables should be passed in from the root module (e.g., main.tf in the root)
# or a tfvars file.
variable "project_name" {
  description = "The name of the project, used for resource naming and tagging."
  type        = string
  default     = "boomcard"
}

variable "environment" {
  description = "The deployment environment (e.g., 'dev', 'staging', 'production')."
  type        = string
  default     = "development" # Default for local testing/dev environments
  validation {
    condition     = contains(["development", "staging", "production"], var.environment)
    error_message = "The environment must be one of 'development', 'staging', or 'production'."
  }
}

variable "vpc_id" {
  description = "The ID of the VPC where ECS resources will be deployed."
  type        = string
}

variable "private_subnet_ids" {
  description = "A list of private subnet IDs where ECS tasks will be launched."
  type        = list(string)
}

variable "public_subnet_ids" {
  description = "A list of public subnet IDs where the Application Load Balancer will be deployed."
  type        = list(string)
}

variable "ecs_security_group_id" {
  description = "The ID of the security group to associate with ECS tasks (allows outbound traffic, allows ingress from ALB)."
  type        = string
}

variable "alb_security_group_id" {
  description = "The ID of the security group to associate with the Application Load Balancer (allows ingress from the internet)."
  type        = string
}

variable "ecr_repository_urls" {
  description = "A map of ECR repository URLs for each application service."
  type = map(string)
  default = {
    consumer_app        = "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/boomcard-consumer-app"
    partner_dashboard   = "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/boomcard-partner-dashboard"
    admin_panel         = "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/boomcard-admin-panel"
    api_gateway         = "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/boomcard-api-gateway"
    analytics_engine    = "ACCOUNT_ID.dkr.ecr.REGION.amazonaws.com/boomcard-analytics-engine"
  }
}

variable "app_ports" {
  description = "Map of container ports that each application service listens on."
  type = map(number)
  default = {
    consumer_app        = 3000 # Standard Next.js port
    partner_dashboard   = 3000 # Next.js instances usually listen on the same port
    admin_panel         = 3000 # Next.js instances usually listen on the same port
    api_gateway         = 8080 # Common Node.js API port
    analytics_engine    = 8081 # Internal service port, if applicable
  }
}

variable "desired_counts" {
  description = "Desired number of running tasks for each service."
  type = map(number)
  default = {
    consumer_app        = 2
    partner_dashboard   = 2
    admin_panel         = 1
    api_gateway         = 2
    analytics_engine    = 1
  }
}

variable "cpu_units" {
  description = "CPU units (1024 units = 1 vCPU) allocated to each service task."
  type = map(number)
  default = {
    consumer_app        = 512  # 0.5 vCPU
    partner_dashboard   = 512
    admin_panel         = 256
    api_gateway         = 1024 # 1 vCPU
    analytics_engine    = 512
  }
}

variable "memory_mib" {
  description = "Memory in MiB allocated to each service task."
  type = map(number)
  default = {
    consumer_app        = 1024 # 1GB
    partner_dashboard   = 1024
    admin_panel         = 512
    api_gateway         = 2048 # 2GB
    analytics_engine    = 1024
  }
}

variable "domain_name" {
  description = "The root domain name for the application (e.g., example.com). Used for ALB routing."
  type        = string
}

variable "certificate_arn" {
  description = "The ARN of the AWS Certificate Manager (ACM) SSL/TLS certificate for the domain."
  type        = string
}

variable "db_secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret storing database credentials (e.g., PostgreSQL connection string)."
  type        = string
}

variable "redis_secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret storing Redis credentials/connection string."
  type        = string
}

variable "platform_secrets_manager_arn" {
  description = "ARN of the Secrets Manager secret storing general platform secrets (e.g., API keys, JWT secrets)."
  type        = string
}

# --- Data Sources ---
# Used to retrieve current AWS account ID and region for constructing ARNs dynamically.
data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# --- ECS Cluster ---
# The logical grouping of ECS services and tasks.
resource "aws_ecs_cluster" "boomcard_cluster" {
  name = "${var.project_name}-${var.environment}-cluster"

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# --- IAM Roles for ECS ---

# IAM Role for ECS Task Execution
# This role grants the ECS agent permissions to perform actions like:
# - Pulling container images from ECR.
# - Sending container logs to CloudWatch Logs.
# - Retrieving secrets from AWS Secrets Manager if referenced by `valueFrom` in container definitions.
resource "aws_iam_role" "ecs_task_execution_role" {
  name_prefix        = "${var.project_name}-${var.environment}-ecs-task-execution-role-"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# Attach the managed policy required for ECS task execution.
resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

# Custom policy to allow the task execution role to retrieve secrets from Secrets Manager.
# This is specifically for secrets used by the ECS agent (e.g., image pull secrets or direct `valueFrom` references).
resource "aws_iam_policy" "ecs_task_execution_secrets_policy" {
  name_prefix = "${var.project_name}-${var.environment}-ecs-execution-secrets-policy-"
  policy      = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt" # Required if secrets are encrypted with KMS
        ],
        Resource = [
          var.db_secrets_manager_arn,
          var.redis_secrets_manager_arn,
          var.platform_secrets_manager_arn
        ]
      }
    ]
  })
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_secrets_attachment" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = aws_iam_policy.ecs_task_execution_secrets_policy.arn
}

# IAM Role for ECS Tasks
# This role is assumed by the container itself and grants it permissions to interact with other AWS services
# (e.g., S3 for file storage, SQS/SNS for messaging, RDS access if not via Secrets Manager).
resource "aws_iam_role" "ecs_task_role" {
  name_prefix        = "${var.project_name}-${var.environment}-ecs-task-role-"
  assume_role_policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Action    = "sts:AssumeRole",
        Effect    = "Allow",
        Principal = {
          Service = "ecs-tasks.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# Custom policy to allow ECS tasks to read from Secrets Manager and other AWS services.
# This policy grants permissions for the application running inside the container.
resource "aws_iam_policy" "ecs_task_app_permissions_policy" {
  name_prefix = "${var.project_name}-${var.environment}-ecs-task-app-permissions-policy-"
  policy = jsonencode({
    Version   = "2012-10-17",
    Statement = [
      {
        Effect   = "Allow",
        Action   = [
          "secretsmanager:GetSecretValue",
          "kms:Decrypt" # Required if secrets are KMS encrypted
        ],
        Resource = [
          var.db_secrets_manager_arn,
          var.redis_secrets_manager_arn,
          var.platform_secrets_manager_arn
        ]
      },
      # Permissions for S3 access (e.g., for user-uploaded content, images)
      {
        Effect   = "Allow",
        Action   = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
          "s3:ListBucket" # Potentially needed for specific S3 operations
        ],
        Resource = [
          "arn:aws:s3:::${var.project_name}-${var.environment}-assets/*", # Specific bucket for assets
          "arn:aws:s3:::${var.project_name}-${var.environment}-assets"
        ]
      },
      # Permissions for SQS/SNS (if using for messaging/eventing)
      {
        Effect   = "Allow",
        Action   = [
          "sqs:SendMessage",
          "sqs:ReceiveMessage",
          "sqs:DeleteMessage",
          "sqs:GetQueueAttributes",
          "sns:Publish"
        ],
        Resource = [
          "arn:aws:sqs:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${var.project_name}-${var.environment}-*",
          "arn:aws:sns:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:${var.project_name}-${var.environment}-*"
        ]
      }
      # Add other permissions as needed (e.g., DynamoDB, Lambda invoke, etc.)
    ]
  })
  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

resource "aws_iam_role_policy_attachment" "ecs_task_app_permissions_attachment" {
  role       = aws_iam_role.ecs_task_role.name
  policy_arn = aws_iam_policy.ecs_task_app_permissions_policy.arn
}

# --- CloudWatch Log Groups ---
# Centralized logging for each ECS service.
resource "aws_cloudwatch_log_group" "consumer_app_log_group" {
  name              = "/ecs/${var.project_name}-${var.environment}-consumer-app"
  retention_in_days = var.environment == "production" ? 90 : 30 # Longer retention for production

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "ConsumerApp"
  }
}

resource "aws_cloudwatch_log_group" "partner_dashboard_log_group" {
  name              = "/ecs/${var.project_name}-${var.environment}-partner-dashboard"
  retention_in_days = var.environment == "production" ? 90 : 30

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "PartnerDashboard"
  }
}

resource "aws_cloudwatch_log_group" "admin_panel_log_group" {
  name              = "/ecs/${var.project_name}-${var.environment}-admin-panel"
  retention_in_days = var.environment == "production" ? 90 : 30

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "AdminPanel"
  }
}

resource "aws_cloudwatch_log_group" "api_gateway_log_group" {
  name              = "/ecs/${var.project_name}-${var.environment}-api-gateway"
  retention_in_days = var.environment == "production" ? 90 : 30

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "APIGateway"
  }
}

resource "aws_cloudwatch_log_group" "analytics_engine_log_group" {
  name              = "/ecs/${var.project_name}-${var.environment}-analytics-engine"
  retention_in_days = var.environment == "production" ? 90 : 30

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "AnalyticsEngine"
  }
}

# --- Application Load Balancer (ALB) ---
# Entry point for public-facing services.
resource "aws_lb" "boomcard_alb" {
  name               = "${var.project_name}-${var.environment}-alb"
  internal           = false # Public facing Load Balancer
  load_balancer_type = "application"
  security_groups    = [var.alb_security_group_id]
  subnets            = var.public_subnet_ids

  enable_deletion_protection = var.environment == "production" # Enable for production to prevent accidental deletion

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# --- ALB Target Groups for each service ---
# Target groups are used by the ALB to route requests to ECS tasks based on health checks.
resource "aws_lb_target_group" "consumer_app_tg" {
  name                 = "${var.project_name}-${var.environment}-consumer-app-tg"
  port                 = var.app_ports["consumer_app"]
  protocol             = "HTTP"
  vpc_id               = var.vpc_id
  target_type          = "ip" # Fargate tasks register by IP address

  health_check {
    path                = "/_next/health" # Standard health check path for Next.js applications
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30 # Check every 30 seconds
    timeout             = 5  # Allow 5 seconds for response
    healthy_threshold   = 2  # 2 consecutive successful checks for healthy status
    unhealthy_threshold = 2  # 2 consecutive failed checks for unhealthy status
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "ConsumerApp"
  }
}

resource "aws_lb_target_group" "partner_dashboard_tg" {
  name                 = "${var.project_name}-${var.environment}-partner-dashboard-tg"
  port                 = var.app_ports["partner_dashboard"]
  protocol             = "HTTP"
  vpc_id               = var.vpc_id
  target_type          = "ip"

  health_check {
    path                = "/_next/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "PartnerDashboard"
  }
}

resource "aws_lb_target_group" "admin_panel_tg" {
  name                 = "${var.project_name}-${var.environment}-admin-panel-tg"
  port                 = var.app_ports["admin_panel"]
  protocol             = "HTTP"
  vpc_id               = var.vpc_id
  target_type          = "ip"

  health_check {
    path                = "/_next/health"
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "AdminPanel"
  }
}

resource "aws_lb_target_group" "api_gateway_tg" {
  name                 = "${var.project_name}-${var.environment}-api-gateway-tg"
  port                 = var.app_ports["api_gateway"]
  protocol             = "HTTP"
  vpc_id               = var.vpc_id
  target_type          = "ip"

  health_check {
    path                = "/health" # Common health check endpoint for Node.js APIs
    protocol            = "HTTP"
    matcher             = "200"
    interval            = 30
    timeout             = 5
    healthy_threshold   = 2
    unhealthy_threshold = 2
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "APIGateway"
  }
}

# --- ALB Listeners and Rules ---
# Listeners define the protocol and port the ALB listens on.
# Rules define how traffic is routed to target groups based on host headers or path patterns.

# HTTPS Listener for secure traffic on port 443.
resource "aws_lb_listener" "https_listener" {
  load_balancer_arn = aws_lb.boomcard_alb.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08" # Recommended security policy for TLS
  certificate_arn   = var.certificate_arn

  # Default action for the HTTPS listener if no rules match.
  # A fixed 404 response is a secure default.
  default_action {
    type = "fixed-response"
    fixed_response {
      content_type = "text/plain"
      message_body = "Not Found"
      status_code  = "404"
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# HTTP Listener for redirecting non-secure traffic on port 80 to HTTPS.
resource "aws_lb_listener" "http_listener" {
  load_balancer_arn = aws_lb.boomcard_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301" # Permanent redirect
    }
  }

  tags = {
    Project     = var.project_name
    Environment = var.environment
  }
}

# Listener Rules for path-based routing.
# Assuming the Next.js apps will handle different base paths or subdomains.
# For simplicity, path-based routing is used here. For subdomains, use `host_header` condition.

# Rule for API Gateway traffic (e.g., boomcard.com/api/*)
resource "aws_lb_listener_rule" "api_gateway_rule" {
  listener_arn = aws_lb_listener.https_listener.arn
  priority     = 10 # Higher priority rules are evaluated first

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_gateway_tg.arn
  }

  condition {
    path_pattern {
      values = ["/api/*", "/api"]
    }
  }
  # Alternative: Host-based routing for api.boomcard.com
  # condition {
  #   host_header {
  #     values = ["api.${var.domain_name}"]
  #   }
  # }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "APIGateway"
  }
}

# Rule for Partner Dashboard traffic (e.g., boomcard.com/partner/*)
resource "aws_lb_listener_rule" "partner_dashboard_rule" {
  listener_arn = aws_lb_listener.https_listener.arn
  priority     = 20

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.partner_dashboard_tg.arn
  }

  condition {
    path_pattern {
      values = ["/partner/*", "/partner"]
    }
  }
  # Alternative: Host-based routing for partner.boomcard.com
  # condition {
  #   host_header {
  #     values = ["partner.${var.domain_name}"]
  #   }
  # }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "PartnerDashboard"
  }
}

# Rule for Admin Panel traffic (e.g., boomcard.com/admin/*)
resource "aws_lb_listener_rule" "admin_panel_rule" {
  listener_arn = aws_lb_listener.https_listener.arn
  priority     = 30

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.admin_panel_tg.arn
  }

  condition {
    path_pattern {
      values = ["/admin/*", "/admin"]
    }
  }
  # Alternative: Host-based routing for admin.boomcard.com
  # condition {
  #   host_header {
  #     values = ["admin.${var.domain_name}"]
  #   }
  # }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "AdminPanel"
  }
}

# Default rule for the root path and unmatched paths, routing to the Consumer Web App.
resource "aws_lb_listener_rule" "consumer_app_rule" {
  listener_arn = aws_lb_listener.https_listener.arn
  # This rule should have the lowest priority as it acts as a catch-all for all other paths.
  priority = 40

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.consumer_app_tg.arn
  }

  condition {
    path_pattern {
      values = ["/*"] # Matches all paths not matched by higher priority rules
    }
  }
  # Alternative: Host-based routing for the root domain boomcard.com
  # condition {
  #   host_header {
  #     values = ["${var.domain_name}"]
  #   }
  # }

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "ConsumerApp"
  }
}

# --- ECS Task Definitions ---
# Task definitions describe how a container should run, including its image, CPU/memory,
# port mappings, environment variables, and secrets.
# Using Fargate launch type, which is serverless and highly recommended.

# Consumer Web Application Task Definition (Next.js)
resource "aws_ecs_task_definition" "consumer_app_task" {
  family                   = "${var.project_name}-${var.environment}-consumer-app"
  cpu                      = var.cpu_units["consumer_app"]
  memory                   = var.memory_mib["consumer_app"]
  network_mode             = "awsvpc" # Required for Fargate
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  # Container definitions in JSON format.
  container_definitions = jsonencode([
    {
      name        = "consumer-app"
      image       = var.ecr_repository_urls["consumer_app"]
      cpu         = var.cpu_units["consumer_app"]
      memory      = var.memory_mib["consumer_app"]
      essential   = true # If this container stops, the task stops
      portMappings = [
        {
          containerPort = var.app_ports["consumer_app"]
          hostPort      = var.app_ports["consumer_app"] # For Fargate, hostPort must match containerPort
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = var.environment },
        # Dynamically construct API URL based on environment.
        # This assumes a structure like api.boomcard.com for production, dev-api.boomcard.com for dev.
        { name = "NEXT_PUBLIC_API_URL", value = "https://${var.environment == "production" ? "" : "${var.environment}-"}api.${var.domain_name}/api" },
        { name = "NEXT_PUBLIC_APP_DOMAIN", value = "${var.environment == "production" ? "" : "${var.environment}."}${var.domain_name}" },
        # For full i18n support in Next.js, relevant environment variables (e.g., supported locales)
        # would be configured here, but i18n is an application-level concern, not directly infrastructure.
        # { name = "NEXT_PUBLIC_I18N_LOCALES", value = "en,bg" }
      ]
      secrets = [
        # Example if your Next.js app needs secrets (e.g., for analytics, specific third-party integrations)
        # { name = "GOOGLE_ANALYTICS_KEY", valueFrom = "${var.platform_secrets_manager_arn}:GOOGLE_ANALYTICS_KEY::" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.consumer_app_log_group.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "ConsumerApp"
  }
}

# Partner Dashboard Task Definition (Next.js)
resource "aws_ecs_task_definition" "partner_dashboard_task" {
  family                   = "${var.project_name}-${var.environment}-partner-dashboard"
  cpu                      = var.cpu_units["partner_dashboard"]
  memory                   = var.memory_mib["partner_dashboard"]
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name        = "partner-dashboard"
      image       = var.ecr_repository_urls["partner_dashboard"]
      cpu         = var.cpu_units["partner_dashboard"]
      memory      = var.memory_mib["partner_dashboard"]
      essential   = true
      portMappings = [
        {
          containerPort = var.app_ports["partner_dashboard"]
          hostPort      = var.app_ports["partner_dashboard"]
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "NEXT_PUBLIC_API_URL", value = "https://${var.environment == "production" ? "" : "${var.environment}-"}api.${var.domain_name}/api" },
        { name = "NEXT_PUBLIC_APP_DOMAIN", value = "${var.environment == "production" ? "" : "${var.environment}."}${var.domain_name}" },
        # Base path for Next.js if served under a path like /partner
        { name = "NEXT_PUBLIC_BASE_PATH", value = "/partner" }
      ]
      secrets = [
        # { name = "PARTNER_AUTH_SECRET", valueFrom = "${var.platform_secrets_manager_arn}:PARTNER_AUTH_SECRET::" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.partner_dashboard_log_group.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "PartnerDashboard"
  }
}

# Admin Panel Task Definition (Next.js)
resource "aws_ecs_task_definition" "admin_panel_task" {
  family                   = "${var.project_name}-${var.environment}-admin-panel"
  cpu                      = var.cpu_units["admin_panel"]
  memory                   = var.memory_mib["admin_panel"]
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name        = "admin-panel"
      image       = var.ecr_repository_urls["admin_panel"]
      cpu         = var.cpu_units["admin_panel"]
      memory      = var.memory_mib["admin_panel"]
      essential   = true
      portMappings = [
        {
          containerPort = var.app_ports["admin_panel"]
          hostPort      = var.app_ports["admin_panel"]
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = var.environment },
        { name = "NEXT_PUBLIC_API_URL", value = "https://${var.environment == "production" ? "" : "${var.environment}-"}api.${var.domain_name}/api" },
        { name = "NEXT_PUBLIC_APP_DOMAIN", value = "${var.environment == "production" ? "" : "${var.environment}."}${var.domain_name}" },
        # Base path for Next.js if served under a path like /admin
        { name = "NEXT_PUBLIC_BASE_PATH", value = "/admin" }
      ]
      secrets = [
        # { name = "ADMIN_AUTH_SECRET", valueFrom = "${var.platform_secrets_manager_arn}:ADMIN_AUTH_SECRET::" }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.admin_panel_log_group.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "AdminPanel"
  }
}

# API Gateway Task Definition (Node.js/Express)
resource "aws_ecs_task_definition" "api_gateway_task" {
  family                   = "${var.project_name}-${var.environment}-api-gateway"
  cpu                      = var.cpu_units["api_gateway"]
  memory                   = var.memory_mib["api_gateway"]
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name        = "api-gateway"
      image       = var.ecr_repository_urls["api_gateway"]
      cpu         = var.cpu_units["api_gateway"]
      memory      = var.memory_mib["api_gateway"]
      essential   = true
      portMappings = [
        {
          containerPort = var.app_ports["api_gateway"]
          hostPort      = var.app_ports["api_gateway"]
          protocol      = "tcp"
        }
      ]
      environment = [
        { name = "NODE_ENV", value = var.environment },
        # Other environment variables if not secret, e.g., service discovery endpoints for internal services
        # { name = "ANALYTICS_SERVICE_URL", value = "http://analytics-engine.internal-vpc:8081" }
      ]
      secrets = [
        # Sensitive credentials injected from AWS Secrets Manager
        { name = "DATABASE_URL", valueFrom = "${var.db_secrets_manager_arn}" },
        { name = "REDIS_CONNECTION_STRING", valueFrom = "${var.redis_secrets_manager_arn}" },
        { name = "JWT_SECRET", valueFrom = "${var.platform_secrets_manager_arn}:JWT_SECRET::" },
        { name = "PAYMENT_GATEWAY_API_KEY", valueFrom = "${var.platform_secrets_manager_arn}:PAYMENT_GATEWAY_API_KEY::" },
        # Add any other API keys or sensitive configurations here
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.api_gateway_log_group.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "APIGateway"
  }
}

# Analytics Engine Task Definition (Node.js/Express)
resource "aws_ecs_task_definition" "analytics_engine_task" {
  family                   = "${var.project_name}-${var.environment}-analytics-engine"
  cpu                      = var.cpu_units["analytics_engine"]
  memory                   = var.memory_mib["analytics_engine"]
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.ecs_task_role.arn

  container_definitions = jsonencode([
    {
      name        = "analytics-engine"
      image       = var.ecr_repository_urls["analytics_engine"]
      cpu         = var.cpu_units["analytics_engine"]
      memory      = var.memory_mib["analytics_engine"]
      essential   = true
      # No public port mapping if it's purely a backend worker/service not exposed by ALB
      # If it serves an internal API, a portMapping would be present, but without ALB attachment in the service.
      environment = [
        { name = "NODE_ENV", value = var.environment }
      ]
      secrets = [
        { name = "DATABASE_URL", valueFrom = "${var.db_secrets_manager_arn}" },
        # Secrets specific to analytics (e.g., third-party analytics service credentials)
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          "awslogs-group"         = aws_cloudwatch_log_group.analytics_engine_log_group.name
          "awslogs-region"        = data.aws_region.current.name
          "awslogs-stream-prefix" = "ecs"
        }
      }
    }
  ])

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "AnalyticsEngine"
  }
}

# --- ECS Services ---
# ECS services maintain a desired count of running tasks from a specified task definition.

# Consumer Web App ECS Service
resource "aws_ecs_service" "consumer_app_service" {
  name            = "${var.project_name}-${var.environment}-consumer-app-service"
  cluster         = aws_ecs_cluster.boomcard_cluster.id
  task_definition = aws_ecs_task_definition.consumer_app_task.arn
  desired_count   = var.desired_counts["consumer_app"]
  launch_type     = "FARGATE"

  # Network configuration for Fargate tasks
  network_configuration {
    subnets         = var.private_subnet_ids # Tasks run in private subnets
    security_groups = [var.ecs_security_group_id]
    assign_public_ip = false # Tasks do not need public IPs
  }

  # Associate with the ALB target group
  load_balancer {
    target_group_arn = aws_lb_target_group.consumer_app_tg.arn
    container_name   = "consumer-app"
    container_port   = var.app_ports["consumer_app"]
  }

  # Allows ECS to handle rolling updates gracefully
  deployment_controller {
    type = "ECS"
  }

  # Grace period to allow tasks to register with the load balancer and pass health checks.
  health_check_grace_period_seconds = 60 # Adjust based on application startup time

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "ConsumerApp"
  }
}

# Partner Dashboard ECS Service
resource "aws_ecs_service" "partner_dashboard_service" {
  name            = "${var.project_name}-${var.environment}-partner-dashboard-service"
  cluster         = aws_ecs_cluster.boomcard_cluster.id
  task_definition = aws_ecs_task_definition.partner_dashboard_task.arn
  desired_count   = var.desired_counts["partner_dashboard"]
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.partner_dashboard_tg.arn
    container_name   = "partner-dashboard"
    container_port   = var.app_ports["partner_dashboard"]
  }

  deployment_controller {
    type = "ECS"
  }

  health_check_grace_period_seconds = 60

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "PartnerDashboard"
  }
}

# Admin Panel ECS Service
resource "aws_ecs_service" "admin_panel_service" {
  name            = "${var.project_name}-${var.environment}-admin-panel-service"
  cluster         = aws_ecs_cluster.boomcard_cluster.id
  task_definition = aws_ecs_task_definition.admin_panel_task.arn
  desired_count   = var.desired_counts["admin_panel"]
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.admin_panel_tg.arn
    container_name   = "admin-panel"
    container_port   = var.app_ports["admin_panel"]
  }

  deployment_controller {
    type = "ECS"
  }

  health_check_grace_period_seconds = 60

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "AdminPanel"
  }
}

# API Gateway ECS Service
resource "aws_ecs_service" "api_gateway_service" {
  name            = "${var.project_name}-${var.environment}-api-gateway-service"
  cluster         = aws_ecs_cluster.boomcard_cluster.id
  task_definition = aws_ecs_task_definition.api_gateway_task.arn
  desired_count   = var.desired_counts["api_gateway"]
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.api_gateway_tg.arn
    container_name   = "api-gateway"
    container_port   = var.app_ports["api_gateway"]
  }

  deployment_controller {
    type = "ECS"
  }

  health_check_grace_period_seconds = 60

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "APIGateway"
  }
}

# Analytics Engine ECS Service (internal service, no public ALB attachment)
resource "aws_ecs_service" "analytics_engine_service" {
  name            = "${var.project_name}-${var.environment}-analytics-engine-service"
  cluster         = aws_ecs_cluster.boomcard_cluster.id
  task_definition = aws_ecs_task_definition.analytics_engine_task.arn
  desired_count   = var.desired_counts["analytics_engine"]
  launch_type     = "FARGATE"

  network_configuration {
    subnets         = var.private_subnet_ids
    security_groups = [var.ecs_security_group_id]
    assign_public_ip = false
  }

  # No load balancer block here as it's an internal service not publicly exposed.
  # If it needs to communicate with other services, it can use service discovery
  # or private IPs/DNS within the VPC.

  deployment_controller {
    type = "ECS"
  }

  # Grace period can be shorter if no HTTP health checks are performed by an ALB.
  health_check_grace_period_seconds = 30

  tags = {
    Project     = var.project_name
    Environment = var.environment
    Service     = "AnalyticsEngine"
  }
}

# --- Auto Scaling for ECS Services ---
# Automatically adjusts the desired count of tasks based on metrics like CPU or memory utilization.
# Recommended for production environments to handle varying loads efficiently.

# Auto Scaling for API Gateway Service
resource "aws_appautoscaling_target" "api_gateway_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.boomcard_cluster.name}/${aws_ecs_service.api_gateway_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1 # Minimum number of tasks to run
  max_capacity       = 5 # Maximum number of tasks to scale out to
}

resource "aws_appautoscaling_policy" "api_gateway_policy_cpu" {
  name               = "${var.project_name}-${var.environment}-api-gateway-cpu-policy"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.api_gateway_target.resource_id
  scalable_dimension = aws_appautoscaling_target.api_gateway_target.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70 # Keep average CPU utilization at 70%
    scale_in_cooldown  = 300 # 5 minutes cooldown before scaling in
    scale_out_cooldown = 60  # 1 minute cooldown before scaling out
  }

  depends_on = [aws_appautoscaling_target.api_gateway_target]
}

resource "aws_appautoscaling_policy" "api_gateway_policy_memory" {
  name               = "${var.project_name}-${var.environment}-api-gateway-memory-policy"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.api_gateway_target.resource_id
  scalable_dimension = aws_appautoscaling_target.api_gateway_target.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageMemoryUtilization"
    }
    target_value = 70 # Keep average Memory utilization at 70%
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }

  depends_on = [aws_appautoscaling_target.api_gateway_target]
}

# Auto Scaling for Consumer App Service (similar policies)
resource "aws_appautoscaling_target" "consumer_app_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.boomcard_cluster.name}/${aws_ecs_service.consumer_app_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 5
}

resource "aws_appautoscaling_policy" "consumer_app_policy_cpu" {
  name               = "${var.project_name}-${var.environment}-consumer-app-cpu-policy"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.consumer_app_target.resource_id
  scalable_dimension = aws_appautoscaling_target.consumer_app_target.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }

  depends_on = [aws_appautoscaling_target.consumer_app_target]
}

# Auto Scaling for Partner Dashboard Service
resource "aws_appautoscaling_target" "partner_dashboard_target" {
  service_namespace  = "ecs"
  resource_id        = "service/${aws_ecs_cluster.boomcard_cluster.name}/${aws_ecs_service.partner_dashboard_service.name}"
  scalable_dimension = "ecs:service:DesiredCount"
  min_capacity       = 1
  max_capacity       = 5
}

resource "aws_appautoscaling_policy" "partner_dashboard_policy_cpu" {
  name               = "${var.project_name}-${var.environment}-partner-dashboard-cpu-policy"
  service_namespace  = "ecs"
  resource_id        = aws_appautoscaling_target.partner_dashboard_target.resource_id
  scalable_dimension = aws_appautoscaling_target.partner_dashboard_target.scalable_dimension
  policy_type        = "TargetTrackingScaling"

  target_tracking_scaling_policy_configuration {
    predefined_metric_specification {
      predefined_metric_type = "ECSServiceAverageCPUUtilization"
    }
    target_value = 70
    scale_in_cooldown  = 300
    scale_out_cooldown = 60
  }

  depends_on = [aws_appautoscaling_target.partner_dashboard_target]
}


# --- Outputs ---
# These outputs provide useful information about the deployed ECS infrastructure.
output "ecs_cluster_name" {
  description = "The name of the ECS cluster created."
  value       = aws_ecs_cluster.boomcard_cluster.name
}

output "ecs_cluster_arn" {
  description = "The ARN of the ECS cluster created."
  value       = aws_ecs_cluster.boomcard_cluster.arn
}

output "alb_dns_name" {
  description = "The DNS name of the Application Load Balancer. Use this to configure DNS records (e.g., in Route 53)."
  value       = aws_lb.boomcard_alb.dns_name
}

output "alb_zone_id" {
  description = "The Route 53 Hosted Zone ID of the Application Load Balancer. Required for creating Alias A records in Route 53."
  value       = aws_lb.boomcard_alb.zone_id
}