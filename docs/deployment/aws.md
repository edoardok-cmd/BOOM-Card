# AWS Deployment Guide for BOOM Card Platform

## Overview

This guide provides comprehensive instructions for deploying the BOOM Card discount platform on AWS infrastructure, covering all services from development to production environments.

## Prerequisites

- AWS Account with appropriate IAM permissions
- AWS CLI configured with credentials
- Docker and Docker Compose installed
- Node.js 18+ and npm/yarn
- PostgreSQL client tools
- Redis client tools
- Domain name registered and DNS configured

## Architecture Overview

### Core AWS Services

- **Compute**: EC2, ECS/Fargate, Lambda
- **Storage**: S3, EBS, EFS
- **Database**: RDS (PostgreSQL), ElastiCache (Redis)
- **Networking**: VPC, CloudFront, Route 53, ALB
- **Security**: WAF, Secrets Manager, Certificate Manager
- **Monitoring**: CloudWatch, X-Ray, CloudTrail
- **CI/CD**: CodePipeline, CodeBuild, CodeDeploy

### Infrastructure Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                          CloudFront CDN                          │
├─────────────────────────────────────────────────────────────────┤
│                            Route 53                              │
├─────────────────────────────────────────────────────────────────┤
│                          ALB + WAF                               │
├──────────────────┬────────────────────┬────────────────────────┤
│   ECS Cluster    │   Lambda Functions  │    Static Assets (S3)  │
│  - Web App       │  - Image Processing │    - Frontend Build    │
│  - API Server    │  - Notifications    │    - User Uploads      │
│  - Admin Panel   │  - Analytics Jobs   │    - Partner Assets    │
├──────────────────┴────────────────────┴────────────────────────┤
│                      RDS Multi-AZ                                │
│                    PostgreSQL 15                                 │
├─────────────────────────────────────────────────────────────────┤
│                   ElastiCache Redis                              │
│                  Session & Caching                               │
└─────────────────────────────────────────────────────────────────┘
```

## Environment Setup

### 1. AWS Account Configuration

```bash
# Install AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (eu-west-1), Output format (json)

# Create deployment user
aws iam create-user --user-name boom-card-deployer
aws iam attach-user-policy --user-name boom-card-deployer --policy-arn arn:aws:iam::aws:policy/PowerUserAccess

# Create S3 bucket for deployment artifacts
aws s3 mb s3://boom-card-deployments-{account-id}
```

### 2. VPC and Networking Setup

```bash
# Create VPC with public/private subnets
aws cloudformation create-stack \
  --stack-name boom-card-network \
  --template-body file://infrastructure/cloudformation/network.yaml \
  --parameters \
    ParameterKey=EnvironmentName,ParameterValue=production \
    ParameterKey=VpcCIDR,ParameterValue=10.0.0.0/16 \
    ParameterKey=PublicSubnet1CIDR,ParameterValue=10.0.10.0/24 \
    ParameterKey=PublicSubnet2CIDR,ParameterValue=10.0.11.0/24 \
    ParameterKey=PrivateSubnet1CIDR,ParameterValue=10.0.20.0/24 \
    ParameterKey=PrivateSubnet2CIDR,ParameterValue=10.0.21.0/24
```

### 3. Security Groups Configuration

```yaml
# security-groups.yaml
WebServerSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for web servers
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 443
        ToPort: 443
        SourceSecurityGroupId: !Ref ALBSecurityGroup
      - IpProtocol: tcp
        FromPort: 80
        ToPort: 80
        SourceSecurityGroupId: !Ref ALBSecurityGroup
    SecurityGroupEgress:
      - IpProtocol: -1
        CidrIp: 0.0.0.0/0

DatabaseSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for RDS PostgreSQL
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 5432
        ToPort: 5432
        SourceSecurityGroupId: !Ref WebServerSecurityGroup
      - IpProtocol: tcp
        FromPort: 5432
        ToPort: 5432
        SourceSecurityGroupId: !Ref LambdaSecurityGroup

RedisSecurityGroup:
  Type: AWS::EC2::SecurityGroup
  Properties:
    GroupDescription: Security group for ElastiCache Redis
    VpcId: !Ref VPC
    SecurityGroupIngress:
      - IpProtocol: tcp
        FromPort: 6379
        ToPort: 6379
        SourceSecurityGroupId: !Ref WebServerSecurityGroup
```

## Database Setup

### 1. RDS PostgreSQL Configuration

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name boom-card-db-subnet \
  --db-subnet-group-description "Subnet group for BOOM Card RDS" \
  --subnet-ids subnet-xxx subnet-yyy

# Create RDS instance
aws rds create-db-instance \
  --db-instance-identifier boom-card-db-prod \
  --db-instance-class db.r6g.large \
  --engine postgres \
  --engine-version 15.4 \
  --master-username boomadmin \
  --master-user-password $(aws secretsmanager get-random-password --output text) \
  --allocated-storage 100 \
  --storage-type gp3 \
  --storage-encrypted \
  --vpc-security-group-ids sg-xxx \
  --db-subnet-group-name boom-card-db-subnet \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00" \
  --preferred-maintenance-window "Mon:04:00-Mon:05:00" \
  --multi-az \
  --enable-performance-insights \
  --performance-insights-retention-period 7

# Store connection details in Secrets Manager
aws secretsmanager create-secret \
  --name boom-card/rds/connection \
  --secret-string '{
    "host": "boom-card-db-prod.xxx.rds.amazonaws.com",
    "port": 5432,
    "database": "boomcard",
    "username": "boomadmin",
    "password": "xxx"
  }'
```

### 2. Database Schema Migration

```bash
# Connect to RDS and create database
psql -h boom-card-db-prod.xxx.rds.amazonaws.com -U boomadmin -d postgres
CREATE DATABASE boomcard;
\c boomcard

# Run migrations
npm run migrate:prod

# Create read replica for analytics
aws rds create-db-instance-read-replica \
  --db-instance-identifier boom-card-db-analytics \
  --source-db-instance-identifier boom-card-db-prod \
  --db-instance-class db.r6g.large
```

### 3. ElastiCache Redis Setup

```bash
# Create ElastiCache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name boom-card-cache-subnet \
  --cache-subnet-group-description "Subnet group for BOOM Card Redis" \
  --subnet-ids subnet-xxx subnet-yyy

# Create Redis cluster
aws elasticache create-replication-group \
  --replication-group-id boom-card-redis-prod \
  --replication-group-description "BOOM Card Redis Cluster" \
  --engine redis \
  --cache-node-type cache.r6g.large \
  --num-cache-clusters 3 \
  --automatic-failover-enabled \
  --cache-subnet-group-name boom-card-cache-subnet \
  --security-group-ids sg-xxx \
  --at-rest-encryption-enabled \
  --transit-encryption-enabled \
  --auth-token $(aws secretsmanager get-random-password --password-length 32 --output text)
```

## Application Deployment

### 1. Container Registry Setup

```bash
# Create ECR repositories
aws ecr create-repository --repository-name boom-card/web-app
aws ecr create-repository --repository-name boom-card/api-server
aws ecr create-repository --repository-name boom-card/admin-panel

# Get login token
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin xxx.dkr.ecr.eu-west-1.amazonaws.com

# Build and push images
docker build -t boom-card/web-app:latest ./apps/web
docker tag boom-card/web-app:latest xxx.dkr.ecr.eu-west-1.amazonaws.com/boom-card/web-app:latest
docker push xxx.dkr.ecr.eu-west-1.amazonaws.com/boom-card/web-app:latest
```

### 2. ECS Cluster Configuration

```yaml
# ecs-cluster.yaml
BoomCardCluster:
  Type: AWS::ECS::Cluster
  Properties:
    ClusterName: boom-card-production
    CapacityProviders:
      - FARGATE
      - FARGATE_SPOT
    DefaultCapacityProviderStrategy:
      - CapacityProvider: FARGATE
        Weight: 1
      - CapacityProvider: FARGATE_SPOT
        Weight: 4
    ClusterSettings:
      - Name: containerInsights
        Value: enabled

TaskExecutionRole:
  Type: AWS::IAM::Role
  Properties:
    AssumeRolePolicyDocument:
      Statement:
        - Effect: Allow
          Principal:
            Service: ecs-tasks.amazonaws.com
          Action: sts:AssumeRole
    ManagedPolicyArns:
      - arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
    Policies:
      - PolicyName: SecretsAccess
        PolicyDocument:
          Statement:
            - Effect: Allow
              Action:
                - secretsmanager:GetSecretValue
              Resource:
                - !Sub arn:aws:secretsmanager:${AWS::Region}:${AWS::AccountId}:secret:boom-card/*
```

### 3. Task Definitions

```json
{
  "family": "boom-card-api",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "1024",
  "memory": "2048",
  "executionRoleArn": "arn:aws:iam::xxx:role/BoomCardTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::xxx:role/BoomCardTaskRole",
  "containerDefinitions": [
    {
      "name": "api-server",
      "image": "xxx.dkr.ecr.eu-west-1.amazonaws.com/boom-card/api-server:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:secretsmanager:eu-west-1:xxx:secret:boom-card/rds/connection:url::"
        },
        {
          "name": "REDIS_URL",
          "valueFrom": "arn:aws:secretsmanager:eu-west-1:xxx:secret:boom-card