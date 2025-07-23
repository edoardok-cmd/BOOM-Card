variable "project_name" {
  description = "The name of the project. Used for resource naming and tagging."
  type        = string
  default     = "boom-card"
}

variable "environment" {
  description = "The deployment environment (e.g., dev, staging, prod). Used for resource naming and tagging."
  type        = string
}

variable "region" {
  description = "The AWS region where resources will be deployed."
  type        = string
}

variable "vpc_cidr_block" {
  description = "The CIDR block for the main VPC (e.g., '10.0.0.0/16')."
  type        = string
}

variable "public_subnet_cidrs" {
  description = "A list of CIDR blocks for the public subnets. Each CIDR should be within the VPC CIDR block and map to an Availability Zone."
  type        = list(string)
  validation {
    condition     = length(var.public_subnet_cidrs) > 0
    error_message = "At least one public subnet CIDR block must be provided."
  }
}

variable "private_subnet_cidrs" {
  description = "A list of CIDR blocks for the private subnets. Each CIDR should be within the VPC CIDR block and map to an Availability Zone."
  type        = list(string)
  validation {
    condition     = length(var.private_subnet_cidrs) > 0
    error_message = "At least one private subnet CIDR block must be provided."
  }
}

variable "availability_zones" {
  description = "A list of Availability Zones to deploy subnets and NAT Gateways into. Must match the number of public and private subnets."
  type        = list(string)
  validation {
    condition     = length(var.availability_zones) == length(var.public_subnet_cidrs) && length(var.availability_zones) == length(var.private_subnet_cidrs)
    error_message = "The number of availability zones must match the number of public and private subnets."
  }
}

variable "bastion_ssh_ingress_cidrs" {
  description = "A list of CIDR blocks allowed to SSH into the bastion host. For security, restrict this to known IPs (e.g., office VPN, jump server IPs)."
  type        = list(string)
  default     = []
}

variable "tags" {
  description = "A map of tags to apply to all resources in this module."
  type        = map(string)
  default     = {}
}

# ----------------------------------------------------------------------------------------------------------------------
# Local Variables
# Common tags are merged with module-specific tags and passed to all resources.
# ----------------------------------------------------------------------------------------------------------------------
locals {
  common_tags = merge(var.tags, {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "Terraform"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# VPC (Virtual Private Cloud)
# The foundational network layer for all AWS resources.
# ----------------------------------------------------------------------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr_block
  enable_dns_support   = true # Enables DNS resolution for instances in the VPC
  enable_dns_hostnames = true # Enables public DNS hostnames for instances
  instance_tenancy     = "default" # Default instance tenancy

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-vpc"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# Internet Gateway (IGW)
# Allows communication between the VPC and the internet. Attached to the VPC.
# ----------------------------------------------------------------------------------------------------------------------
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-igw"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# Elastic IP (EIP) for NAT Gateway
# A static public IP address required for NAT Gateways. One EIP per NAT Gateway.
# ----------------------------------------------------------------------------------------------------------------------
resource "aws_eip" "nat_gateway_eip" {
  count = length(var.public_subnet_cidrs) # Create one EIP per public subnet/AZ where a NAT Gateway will be deployed

  vpc = true # Associate EIP with the VPC

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-nat-gw-eip-${count.index}"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# NAT Gateway (Network Address Translation Gateway)
# Allows instances in private subnets to connect to the internet or other AWS services,
# but prevents the internet from initiating connections to those instances.
# Each NAT Gateway is deployed in a public subnet and uses an Elastic IP.
# ----------------------------------------------------------------------------------------------------------------------
resource "aws_nat_gateway" "main" {
  count         = length(var.public_subnet_cidrs) # Deploy one NAT Gateway per public subnet/AZ
  allocation_id = aws_eip.nat_gateway_eip[count.index].id
  subnet_id     = aws_subnet.public[count.index].id # Associate with its corresponding public subnet

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-nat-gw-${var.availability_zones[count.index]}"
  })

  depends_on = [aws_internet_gateway.main] # Ensure IGW is created before NAT Gateway
}

# ----------------------------------------------------------------------------------------------------------------------
# Subnets
# Logical subdivisions of the VPC, providing isolation and allowing for deployment across multiple Availability Zones
# for high availability.
# ----------------------------------------------------------------------------------------------------------------------

# Public Subnets:
# Instances in these subnets can have public IP addresses and direct internet access via the IGW.
# Used for resources like Load Balancers, Bastion Hosts, and NAT Gateways.
resource "aws_subnet" "public" {
  count                   = length(var.public_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.public_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index] # Map subnets to specific AZs
  map_public_ip_on_launch = true # Automatically assign public IP to instances launched in this subnet

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-public-subnet-${var.availability_zones[count.index]}"
  })
}

# Private Subnets:
# Instances in these subnets do not have public IP addresses and access the internet via NAT Gateway.
# Used for backend application servers, databases, and other sensitive resources.
resource "aws_subnet" "private" {
  count                   = length(var.private_subnet_cidrs)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = var.private_subnet_cidrs[count.index]
  availability_zone       = var.availability_zones[count.index] # Map subnets to specific AZs
  map_public_ip_on_launch = false # Prevent automatic assignment of public IP

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-private-subnet-${var.availability_zones[count.index]}"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# Route Tables
# Control how network traffic is routed from subnets.
# ----------------------------------------------------------------------------------------------------------------------

# Public Route Table:
# Routes all internet-bound traffic (0.0.0.0/0) through the Internet Gateway.
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-public-rt"
  })
}

# Private Route Table:
# Routes all internet-bound traffic (0.0.0.0/0) through the NAT Gateway.
# A separate private route table per AZ is created to point to the NAT Gateway in that AZ.
resource "aws_route_table" "private" {
  count  = length(var.private_subnet_cidrs) # One private route table per private subnet/AZ
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id # Points to the NAT Gateway in the same AZ
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-private-rt-${var.availability_zones[count.index]}"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# Route Table Associations
# Links subnets to their respective route tables.
# ----------------------------------------------------------------------------------------------------------------------

# Associate Public Subnets with the Public Route Table
resource "aws_route_table_association" "public" {
  count          = length(aws_subnet.public)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

# Associate Private Subnets with their corresponding Private Route Tables
resource "aws_route_table_association" "private" {
  count          = length(aws_subnet.private)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ----------------------------------------------------------------------------------------------------------------------
# Security Groups
# Act as virtual firewalls to control inbound and outbound traffic for instances.
# ----------------------------------------------------------------------------------------------------------------------

# Security Group for Application Load Balancer (ALB)
# Allows public HTTP/HTTPS traffic from the internet.
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-${var.environment}-alb-sg"
  description = "Security group for the Application Load Balancer"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTP access from anywhere"
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow HTTPS access from anywhere"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # ALB typically needs to communicate with target groups
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-alb-sg"
  })
}

# Security Group for Web Servers (React/Next.js frontend)
# Allows traffic from the ALB and SSH from the Bastion Host.
resource "aws_security_group" "web_server" {
  name        = "${var.project_name}-${var.environment}-web-server-sg"
  description = "Security group for web servers (React/Next.js)"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 80
    to_port         = 80
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Allow HTTP access from ALB"
  }

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.alb.id]
    description     = "Allow HTTPS access from ALB"
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_host.id]
    description     = "Allow SSH access from Bastion Host"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Allow outbound to App Server SG and internet (via NAT GW)
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-web-server-sg"
  })
}

# Security Group for Application Servers (Node.js/Express backend)
# Allows traffic from Web Servers, SSH from Bastion Host.
resource "aws_security_group" "app_server" {
  name        = "${var.project_name}-${var.environment}-app-server-sg"
  description = "Security group for application servers (Node.js/Express)"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 3000 # Example Node.js/Express application port
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.web_server.id]
    description     = "Allow access from Web Servers"
  }

  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_host.id]
    description     = "Allow SSH access from Bastion Host"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Allow outbound to DB, Redis, other services, and internet (via NAT GW)
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-app-server-sg"
  })
}

# Security Group for Database (PostgreSQL)
# Allows traffic only from Application Servers and Bastion Host (for administrative access).
resource "aws_security_group" "database" {
  name        = "${var.project_name}-${var.environment}-database-sg"
  description = "Security group for PostgreSQL database"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432 # PostgreSQL default port
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app_server.id]
    description     = "Allow PostgreSQL access from Application Servers"
  }

  # This SSH rule is typically for EC2 instances acting as DB servers. For RDS, this is generally not needed.
  # Leaving it as an example for non-RDS deployments or specific direct access needs.
  ingress {
    from_port       = 22
    to_port         = 22
    protocol        = "tcp"
    security_groups = [aws_security_group.bastion_host.id]
    description     = "Allow SSH access from Bastion Host (if managing directly)"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Can be restricted further, e.g., only to S3/CloudWatch VPC endpoints
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-database-sg"
  })
}

# Security Group for Cache (Redis)
# Allows traffic only from Application Servers.
resource "aws_security_group" "redis" {
  name        = "${var.project_name}-${var.environment}-redis-sg"
  description = "Security group for Redis cache"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 6379 # Redis default port
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.app_server.id]
    description     = "Allow Redis access from Application Servers"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"] # Minimal egress needed, can be restricted.
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-redis-sg"
  })
}

# Security Group for Bastion Host (SSH Jump Server)
# Allows SSH access only from specified trusted IP ranges.
resource "aws_security_group" "bastion_host" {
  name        = "${var.project_name}-${var.environment}-bastion-sg"
  description = "Security group for Bastion Host (SSH jump server)"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.bastion_ssh_ingress_cidrs
    description = "Allow SSH access from specified trusted CIDR blocks"
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = [aws_vpc.main.cidr_block] # Restrict egress to within the VPC for internal management
    description = "Allow all outbound traffic to VPC"
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-bastion-sg"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# VPC Endpoints
# Allow private connections from your VPC to supported AWS services, eliminating the need for an internet gateway,
# NAT device, VPN connection, or AWS Direct Connect connection.
# ----------------------------------------------------------------------------------------------------------------------

# S3 Gateway Endpoint: For high-throughput access to S3 buckets.
resource "aws_vpc_endpoint" "s3" {
  vpc_id       = aws_vpc.main.id
  service_name = "com.amazonaws.${var.region}.s3"
  vpc_endpoint_type = "Gateway" # Gateway endpoints are for S3 and DynamoDB
  route_table_ids   = concat(aws_route_table.public.*.id, aws_route_table.private.*.id) # Associate with all route tables

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-s3-vpce"
  })
}

# CloudWatch Logs Interface Endpoint: For sending logs to CloudWatch from instances.
resource "aws_vpc_endpoint" "cloudwatch_logs" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.logs"
  vpc_endpoint_type   = "Interface" # Interface endpoints use ENIs
  private_dns_enabled = true # Enable private DNS names for the endpoint
  security_group_ids  = [
    aws_security_group.app_server.id,
    aws_security_group.web_server.id,
    aws_security_group.database.id
  ]
  subnet_ids          = aws_subnet.private.*.id # Deploy ENIs in private subnets

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-cloudwatch-logs-vpce"
  })
}

# ECR API Interface Endpoint: For managing ECR repositories and getting authentication tokens.
resource "aws_vpc_endpoint" "ecr_api" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ecr.api"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.app_server.id, aws_security_group.web_server.id]
  subnet_ids          = aws_subnet.private.*.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-ecr-api-vpce"
  })
}

# ECR DKR Interface Endpoint: For pulling (docker push/pull) images from ECR.
resource "aws_vpc_endpoint" "ecr_dkr" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.dkr.ecr"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.app_server.id, aws_security_group.web_server.id]
  subnet_ids          = aws_subnet.private.*.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-ecr-dkr-vpce"
  })
}

# SSM (Systems Manager) Interface Endpoints: For managing instances using SSM (Session Manager, Run Command).
resource "aws_vpc_endpoint" "ssm" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ssm"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.app_server.id, aws_security_group.web_server.id, aws_security_group.bastion_host.id]
  subnet_ids          = aws_subnet.private.*.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-ssm-vpce"
  })
}

resource "aws_vpc_endpoint" "ssm_messages" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ssmmessages"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.app_server.id, aws_security_group.web_server.id, aws_security_group.bastion_host.id]
  subnet_ids          = aws_subnet.private.*.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-ssmmessages-vpce"
  })
}

resource "aws_vpc_endpoint" "ec2messages" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.ec2messages"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.app_server.id, aws_security_group.web_server.id, aws_security_group.bastion_host.id]
  subnet_ids          = aws_subnet.private.*.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-ec2messages-vpce"
  })
}

# Secrets Manager Interface Endpoint: For retrieving secrets (e.g., database credentials) securely.
resource "aws_vpc_endpoint" "secretsmanager" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.region}.secretsmanager"
  vpc_endpoint_type   = "Interface"
  private_dns_enabled = true
  security_group_ids  = [aws_security_group.app_server.id] # Application servers need access to secrets
  subnet_ids          = aws_subnet.private.*.id

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-secretsmanager-vpce"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# DB Subnet Group
# Required for deploying Amazon RDS instances into private subnets within the VPC.
# Ensures RDS instances can be highly available across multiple AZs.
# ----------------------------------------------------------------------------------------------------------------------
resource "aws_db_subnet_group" "main" {
  name        = "${var.project_name}-${var.environment}-db-subnet-group"
  description = "DB subnet group for ${var.project_name} ${var.environment} RDS instances"
  subnet_ids  = aws_subnet.private.*.id # RDS instances typically go into private subnets

  tags = merge(local.common_tags, {
    Name = "${var.project_name}-${var.environment}-db-subnet-group"
  })
}

# ----------------------------------------------------------------------------------------------------------------------
# Outputs
# Exported values that can be used by other Terraform modules or referenced externally.
# ----------------------------------------------------------------------------------------------------------------------

output "vpc_id" {
  description = "The ID of the created VPC."
  value       = aws_vpc.main.id
}

output "public_subnet_ids" {
  description = "A list of IDs of the public subnets."
  value       = aws_subnet.public.*.id
}

output "private_subnet_ids" {
  description = "A list of IDs of the private subnets."
  value       = aws_subnet.private.*.id
}

output "database_subnet_group_name" {
  description = "The name of the DB Subnet Group, required for RDS deployments."
  value       = aws_db_subnet_group.main.name
}

output "alb_security_group_id" {
  description = "The ID of the Security Group for the Application Load Balancer."
  value       = aws_security_group.alb.id
}

output "web_server_security_group_id" {
  description = "The ID of the Security Group for Web Servers (React/Next.js)."
  value       = aws_security_group.web_server.id
}

output "app_server_security_group_id" {
  description = "The ID of the Security Group for Application Servers (Node.js/Express)."
  value       = aws_security_group.app_server.id
}

output "database_security_group_id" {
  description = "The ID of the Security Group for the Database (PostgreSQL)."
  value       = aws_security_group.database.id
}

output "redis_security_group_id" {
  description = "The ID of the Security Group for Redis."
  value       = aws_security_group.redis.id
}

output "bastion_host_security_group_id" {
  description = "The ID of the Security Group for the Bastion Host."
  value       = aws_security_group.bastion_host.id
}