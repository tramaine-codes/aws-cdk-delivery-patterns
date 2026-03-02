# Security & Compliance Specification

## Overview

Security controls and compliance checks enforced through cdk-nag `AwsSolutionsChecks` to ensure infrastructure follows AWS best practices.

## Compliance Framework

### Tool: cdk-nag
- **Version**: 2.37.55
- **Rule Pack**: `AwsSolutionsChecks`
- **Enforcement**: Synthesis-time (fails on violations)
- **Application Point**: `bin/aws-cdk-delivery-patterns.ts`

## Security Controls by Resource Type

### S3 Buckets

#### Mandatory Controls
1. **Public Access Block**: All four settings enabled
2. **Server Access Logging**: All buckets except logs bucket itself
3. **Encryption at Rest**: S3-managed or KMS
4. **SSL/TLS Enforcement**: Bucket policy denies non-SSL requests
5. **Versioning**: Application bucket only

### KMS Keys

#### Mandatory Controls
1. **Key Rotation**: Enabled on all keys
2. **Alias**: Descriptive alias for identification

### IAM Policies

**`AwsSolutions-IAM5`** — Wildcard permissions
- **Status**: Suppressed (DeliveryPipelineStack)
- **Reason**: CDK Pipelines generates wildcards internally

### CodeBuild Projects

**`AwsSolutions-CB4`** — KMS encryption
- **Status**: Suppressed (DeliveryPipelineStack)
- **Reason**: CDK Pipelines doesn't expose encryption key API

## Current Suppressions

### Stack-Level
- `AwsSolutions-CB4`: CodeBuild encryption (DeliveryPipelineStack)
- `AwsSolutions-IAM5`: Wildcard IAM (DeliveryPipelineStack)

### Resource-Level
- `AwsSolutions-S1`: Server access logs bucket (LoggingStack)

## Compliance Verification

```bash
npx cdk synth  # Runs cdk-nag checks
```

Reports: `cdk.out/AwsSolutions-<StackName>-NagReport.csv`
