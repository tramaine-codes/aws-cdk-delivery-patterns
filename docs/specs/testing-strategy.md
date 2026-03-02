# Testing Strategy Specification

## Overview

Unit testing strategy using Vitest and CDK assertions to verify infrastructure code correctness.

## Testing Framework

### Tool: Vitest
- **Version**: 4.0.18
- **Config**: `vite.config.unit.ts`
- **Test Location**: `test/unit/`
- **Structure**: Mirrors `lib/` directory structure

### CDK Assertions
- **Package**: `aws-cdk-lib/assertions`
- **Primary API**: `Template.fromStack()`

## Test Organization

### Directory Structure
```
test/unit/
├── application/
│   ├── application-stack.test.ts
│   └── application-stage.test.ts
├── logging/
│   └── logging-stack.test.ts
├── pipeline/
│   ├── delivery-pipeline-stack.test.ts
│   └── artifacts/
│       ├── artifacts-key.test.ts
│       └── artifacts-bucket.test.ts
└── repository/
    └── repository-stack.test.ts
```

## Testing Patterns

### Stack Setup Pattern
```typescript
describe('StackName', () => {
  const app = new cdk.App();
  const stack = new StackName(app, 'TestStack', {});
  const template = Template.fromStack(stack);

  test('description', () => {
    // assertions
  });
});
```

### Assertion Types

#### 1. Resource Properties
```typescript
template.hasResourceProperties('AWS::S3::Bucket', {
  BucketEncryption: {
    ServerSideEncryptionConfiguration: [
      { ServerSideEncryptionByDefault: { SSEAlgorithm: 'AES256' } }
    ]
  }
});
```

#### 2. Resource Metadata
```typescript
template.hasResource('AWS::KMS::Key', {
  DeletionPolicy: 'Delete',
  UpdateReplacePolicy: 'Delete'
});
```

#### 3. Partial Matching
```typescript
template.hasResourceProperties('AWS::S3::BucketPolicy', {
  PolicyDocument: Match.objectLike({
    Statement: Match.arrayWith([
      Match.objectLike({
        Action: 's3:*',
        Effect: 'Deny'
      })
    ])
  })
});
```

## Test Coverage Areas

### Security Controls
- Public access block configuration
- SSL enforcement policies
- Encryption settings
- Access logging configuration

### Resource Configuration
- Removal policies
- Versioning settings
- Key rotation
- Bucket policies

### Compliance
- cdk-nag suppressions applied correctly
- Required properties present

## Running Tests

### Commands
```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Single test file
npx vitest run --dir test/unit --config ./vite.config.unit.ts test/unit/<filename>.test.ts

# Coverage report
npm run test:cov
```

### CI Integration
- Pre-commit hook runs `npm run build:ci` (includes tests)
- Pipeline synth stage runs `npm run build` (type-check only)

## Test Conventions

### One Assertion Per Test
Each test should verify one specific behavior:
```typescript
test('creates a KMS key with an alias', () => {
  template.hasResourceProperties('AWS::KMS::Alias', {
    AliasName: 'alias/aws-cdk-delivery-patterns/pipeline-artifacts'
  });
});

test('enables key rotation', () => {
  template.hasResourceProperties('AWS::KMS::Key', {
    EnableKeyRotation: true
  });
});
```

### Descriptive Test Names
- Use clear, behavior-focused descriptions
- Avoid technical jargon in test names
- Focus on "what" not "how"

### Test Organization
- Group related tests with `describe()` blocks
- One `describe()` per construct/stack
- Nested `describe()` for complex constructs

## Coverage Goals

### Current Coverage
- All stacks have unit tests
- All custom constructs have unit tests
- Security controls verified
- Resource configuration verified

### Not Covered
- Integration tests (actual deployment)
- End-to-end pipeline execution
- Cross-stack reference validation
- Runtime behavior

## Future Enhancements

### Potential Improvements
1. **Integration Tests**: Deploy to test account, verify resources
2. **Snapshot Tests**: Capture CloudFormation template snapshots
3. **Property-Based Tests**: Generate random valid configurations
4. **Performance Tests**: Measure synthesis time
5. **Contract Tests**: Verify cross-stack interfaces
