# Pipeline Architecture Specification

## Overview

Self-mutating CI/CD pipeline using AWS CDK Pipelines that automatically deploys infrastructure changes when code is pushed to CodeCommit main branch.

## Architecture Components

### Source Control
- **Service**: AWS CodeCommit
- **Repository**: `aws-cdk-delivery-patterns`
- **Branch**: `main`
- **Trigger**: Push events

### Pipeline Stages

#### 1. Source Stage
- Pulls code from CodeCommit
- Triggered on push to main

#### 2. Build (Synth) Stage
- **Build Image**: CodeBuild Standard 7.0
- **Runtime**: Node.js 24, npm 11.11.0
- **Commands**:
  - `npm ci`
  - `npm run build`
  - `npx cdk synth`

#### 3. UpdatePipeline (Self-Mutation) Stage
- Updates pipeline if pipeline code changed
- Pipeline restarts automatically after mutation

#### 4. Application Deployment Stage (Dev)
- Deploys `ApplicationStage`:
  - `LoggingStack` (stage-local)
  - `ApplicationStack`

### Artifacts Management

#### Artifacts Bucket
- **Encryption**: KMS customer-managed key
- **Key Rotation**: Enabled
- **Access Logging**: To shared server access logs bucket
- **Public Access**: Blocked
- **SSL**: Enforced

#### Artifacts KMS Key
- **Alias**: `alias/aws-cdk-delivery-patterns/pipeline-artifacts`
- **Rotation**: Enabled

### Cross-Stack Dependencies

```
LoggingStack (shared) ──┐
                        ├──> DeliveryPipelineStack
RepositoryStack ────────┘

DeliveryPipelineStack
  └──> ApplicationStage
         ├──> LoggingStack (stage-local)
         └──> ApplicationStack
```

## Deployment Process

### Initial Setup
1. Deploy `LoggingStack`
2. Deploy `RepositoryStack`
3. Configure CodeCommit remote
4. Deploy `DeliveryPipelineStack`
5. Push to CodeCommit main

### Subsequent Updates
1. Make code changes
2. Commit (Conventional Commits)
3. Push to CodeCommit
4. Pipeline auto-deploys

## Environment Configuration

- **Account**: From `CDK_DEFAULT_ACCOUNT`
- **Region**: `us-east-1`
- **Node.js**: 24.14.0 (Volta/NVM)

## Failure Handling

- Build failures: Pipeline stops, no deployment
- Self-mutation failures: Manual intervention required
- Deployment failures: CloudFormation rollback

## Extensibility

### Adding Environments
```typescript
const prodStage = new ApplicationStage(this, 'Prod', { env });
pipeline.addStage(prodStage);
```

### Adding Pre/Post Steps
- Use `addPre()` or `addPost()` on stage
- Can add manual approvals or tests
