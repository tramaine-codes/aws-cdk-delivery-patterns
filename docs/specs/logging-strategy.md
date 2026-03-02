# Logging Strategy Specification

## Overview

Centralized S3 server access logging strategy that addresses cdk-nag `AwsSolutions-S1` while avoiding circular dependencies.

## Architecture Pattern

### Two-Tier Logging Model

#### Tier 1: Shared Logging Stack (Pipeline-Level)
- **Purpose**: Server access logs bucket for pipeline resources
- **Scope**: CDK app root (outside stages)
- **Deployed**: Once per account/region
- **Consumers**: Pipeline artifacts bucket

#### Tier 2: Stage-Local Logging Stack (Application-Level)
- **Purpose**: Server access logs bucket for application resources
- **Scope**: Within `ApplicationStage`
- **Deployed**: Once per stage (Dev, Prod, etc.)
- **Consumers**: Application bucket

## Design Rationale

### Why Two Logging Stacks?

**Problem**: CDK Pipelines stages are isolated. Cross-stack references between root app and stages create deployment complexity.

**Solution**: Deploy stage-local `LoggingStack` within each `ApplicationStage` to keep cross-stack references within stage boundaries.

### Benefits
1. **Isolation**: Each stage has own logging infrastructure
2. **Simplicity**: No cross-stage dependencies
3. **Compliance**: Satisfies cdk-nag `AwsSolutions-S1`
4. **Scalability**: Easy to add stages

## Implementation

### Shared LoggingStack
- **Location**: `lib/logging/logging-stack.ts`
- **Instantiation**: `bin/aws-cdk-delivery-patterns.ts`
- **Consumers**: `DeliveryPipelineStack`

### Stage-Local LoggingStack
- **Location**: Same construct, different instance
- **Instantiation**: `lib/application/application-stage.ts`
- **Consumers**: `ApplicationStack`

## Logging Flow

### Pipeline Level
```
Pipeline Artifacts Bucket
  └──> Shared Server Access Logs Bucket
```

### Application Level (Per Stage)
```
Application Bucket (Dev)
  └──> Stage-Local Server Access Logs Bucket (Dev)
```

## Security Controls

### Encryption
- **Algorithm**: AES256 (S3-managed)
- **Rationale**: Logs don't contain sensitive data

### Access Control
- **Public Access**: Blocked
- **SSL**: Enforced
- **IAM**: Bucket owner and logging service only

### Retention
- **Policy**: Auto-delete on stack deletion
- **Rationale**: Development environment

## Compliance

### cdk-nag AwsSolutions-S1
- **Requirement**: S3 buckets should have access logging
- **Status**: ✅ Compliant
- **Suppression**: Server access logs buckets (cannot log to themselves)

## Extensibility

### Adding New Stages
Each stage automatically gets its own logging:
```typescript
const prodStage = new ApplicationStage(this, 'Prod', { env });
// Includes own LoggingStack instance
```

### Adding New Buckets
1. Pass `serverAccessLogsBucket` via props
2. Configure `serverAccessLogsBucket` on bucket
3. Ensure same stack or cross-stack reference

## Limitations

- Server access logs buckets don't log to themselves
- Logs not aggregated across stages
- No lifecycle policies (deleted on removal)
- No log analysis tools configured
