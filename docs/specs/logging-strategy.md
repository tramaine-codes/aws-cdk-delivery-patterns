# Logging Strategy Specification

## Overview

S3 server access logging strategy that addresses cdk-nag `AwsSolutions-S1` while avoiding circular dependencies and cross-stage reference complexity.

## Architecture Pattern

### Logging Model

#### Pipeline Artifacts Bucket (Self-Contained)
- **Purpose**: Access logging for pipeline artifact storage
- **Scope**: Within the `ArtifactsBucket` construct
- **Implementation**: Internal logging bucket provisioned directly inside `ArtifactsBucket`
- **Rationale**: Eliminates cross-stack dependency between `LoggingStack` and `DeliveryPipelineStack`, enabling `LoggingStack` to be pipeline-managed

#### Foundational Logging Stack (Pipeline-Level)
- **Purpose**: Shared server access logs bucket for foundational and future pipeline-level resources
- **Scope**: Within `FoundationalStage` (pipeline-managed)
- **Deployed**: Once per account/region via the pipeline
- **Instantiation**: `lib/pipeline/foundational-stage.ts`

#### Stage-Local Logging Stack (Application-Level)
- **Purpose**: Server access logs bucket for application resources
- **Scope**: Within `ApplicationStage`
- **Deployed**: Once per stage (Dev, Prod, etc.)
- **Consumers**: `ApplicationStack`
- **Instantiation**: `lib/application/application-stage.ts`

## Design Rationale

### Why Self-Contained Logging in ArtifactsBucket?

**Problem**: A cross-stack reference from `LoggingStack` to `DeliveryPipelineStack` created a bootstrap dependency — `LoggingStack` had to be manually deployed before the pipeline could be created. This prevented `LoggingStack` from being pipeline-managed.

**Solution**: `ArtifactsBucket` provisions its own internal logging bucket. The construct is fully self-contained with no external logging dependency.

### Why Stage-Local LoggingStack in ApplicationStage?

**Problem**: CDK Pipelines stages are isolated. Cross-stack references between the root app (or `FoundationalStage`) and `ApplicationStage` create deployment complexity.

**Solution**: Deploy a stage-local `LoggingStack` within each `ApplicationStage` to keep cross-stack references within stage boundaries.

### Benefits
1. **Minimal manual bootstrap**: Only `RepositoryStack` and `DeliveryPipelineStack` require manual initial deployment
2. **Pipeline-managed**: `LoggingStack` and `NetworkStack` are deployed and updated by the pipeline
3. **Isolation**: Each application stage has its own logging infrastructure
4. **Compliance**: Satisfies cdk-nag `AwsSolutions-S1`
5. **Scalability**: Easy to add stages or new pipeline-level resources

## Logging Flow

### Pipeline Artifacts
```
ArtifactsBucket (KMS Encrypted)
  └──> Internal Logging Bucket (within ArtifactsBucket construct, S3-managed)
```

### Application Level (Per Stage)
```
Application Bucket (Dev)
  └──> Stage-Local Server Access Logs Bucket (Dev)
```

## Security Controls

### Encryption
- **Algorithm**: AES256 (S3-managed) for all logging buckets
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
- **Suppression**: Logging buckets themselves (cannot log to themselves)

## Extensibility

### Adding New Stages
Each stage automatically gets its own logging:
```typescript
const prodStage = new ApplicationStage(this, 'Prod', { env });
// Includes own LoggingStack instance
```

### Adding New Pipeline-Level Buckets
Pass the `serverAccessLogsBucket` from `FoundationalStage`'s `LoggingStack` via stage props, or provision a self-contained internal logging bucket within the construct (as `ArtifactsBucket` does).

## Limitations

- Server access logs buckets don't log to themselves
- Logs not aggregated across stages
- No lifecycle policies (deleted on removal)
- No log analysis tools configured
