# KIRO.md

This file provides guidance to Kiro CLI when working with code in this repository.

## Architecture

This is an AWS CDK TypeScript project demonstrating cloud delivery patterns with a self-mutating CI/CD pipeline. The CDK app is executed directly from TypeScript via `tsx` (no compile step needed at runtime).

### Entry Point

**`bin/aws-cdk-delivery-patterns.ts`** — CDK app entry point that:
- Instantiates all stacks and passes them to `cdk.App`
- Applies `AwsSolutionsChecks` from cdk-nag to the entire app
- Defines the AWS environment (account from env var, region hardcoded to `us-east-1`)

### Stack Organization

**`lib/`** — CDK constructs organized by domain. Within each domain directory, stacks and stages live at the top level; other constructs live in named subdirectories that reflect their contents.

- **`lib/application/`**
  - `ApplicationStack` — Provisions application resources (S3 bucket with versioning)
  - `ApplicationStage` — CDK Stage that deploys both `LoggingStack` and `ApplicationStack` together to maintain cross-stack references within the same stage boundary

- **`lib/logging/`**
  - `LoggingStack` — Provisions a shared S3 server access logs bucket used by all pipeline-level resources

- **`lib/pipeline/`**
  - `DeliveryPipelineStack` — Owns `ArtifactsBucket` and `ApplicationStage`; delegates pipeline mechanics to `DeliveryPipeline`
  - **`lib/pipeline/artifacts/`**
    - `ArtifactsBucket` — S3 bucket for pipeline artifacts with KMS encryption and access logging (KMS key managed internally)
  - **`lib/pipeline/delivery-pipeline/`**
    - `DeliveryPipeline` — `CodePipeline` construct; accepts an artifact bucket, repository, and stage as props

- **`lib/repository/`**
  - `RepositoryStack` — Provisions the CodeCommit repository

### Stack Dependencies

1. `LoggingStack` and `RepositoryStack` are independent and can be deployed in either order
2. `DeliveryPipelineStack` depends on both `LoggingStack` and `RepositoryStack`
3. Within the pipeline, `ApplicationStage` deploys its own `LoggingStack` instance alongside `ApplicationStack`

### Testing

**`test/unit/`** — Vitest unit tests mirroring the `lib/` structure. CDK stack assertions use `aws-cdk-lib/assertions` (`Template.fromStack`).

## TypeScript Configuration

`tsconfig.json` has `noEmit: true` — TypeScript is used for type-checking only. The CDK CLI runs the app via `npx tsx` (configured in `cdk.json`).

## Tooling

- **Linter/Formatter**: [Biome](https://biomejs.dev/) (not ESLint/Prettier)
  - Single quotes, 2-space indent, trailing commas (ES5), 80-char line width
  - Config: `biome.json`
- **Test runner**: Vitest (not Jest)
  - Config: `vite.config.unit.ts`
  - Tests: `test/unit/`
- **Security checks**: [cdk-nag](https://github.com/cdklabs/cdk-nag) with `AwsSolutionsChecks`
  - Applied in `bin/aws-cdk-delivery-patterns.ts`
  - Runs automatically during `cdk synth` — synthesis fails on unaddressed violations
  - Use `NagSuppressions` to suppress findings that cannot be fixed in code; always include a `reason`
- **Commit convention**: Conventional Commits enforced via commitlint + husky
- **Pre-commit hook**: Runs `npm run build:ci` (clean → test → tsc) and `lint-staged` (biome format + lint on staged files)

## Commands

```bash
# Type checking (noEmit — does not produce JS output)
npm run build

# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run a single test file
npx vitest run --dir test/unit --config ./vite.config.unit.ts test/unit/<filename>.test.ts

# Run tests with coverage
npm run test:cov

# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix

# Format
npm run format

# Full CI build (clean → test → tsc)
npm run build:ci

# CDK commands (uses tsx to run TS directly)
npx cdk synth
npx cdk diff
npx cdk deploy
```

## Code Conventions

### TypeScript

- Always sort lists of field names alphabetically (interface properties, object literals, enum members, etc.)
- Use `readonly` for interface properties that should not be mutated
- Use `type` imports where possible (`import type`)
- Prefer interfaces over type aliases for object shapes
- Use explicit return types on exported functions and methods

### CDK Patterns

- **Stack props**: Create a dedicated interface extending `cdk.StackProps` for any stack that requires additional properties
- **Construct exports**: Export resources from constructs via readonly properties (e.g., `readonly bucket: s3.IBucket`)
- **Cross-stack references**: Pass resources between stacks via stack props, not by importing stack instances
- **Removal policies**: Use `RemovalPolicy.DESTROY` for development/demo resources to enable clean teardown
- **Descriptions**: Always provide a `description` in stack props to document the stack's purpose
- **Naming**: Use descriptive construct IDs that reflect the resource's purpose (e.g., `ServerAccessLogsBucket`, not `Bucket1`)

### Security Best Practices

- **S3 buckets**: Always configure `blockPublicAccess`, `enforceSSL`, and encryption
- **Server access logging**: All S3 buckets (except the logs bucket itself) must send access logs to the shared `serverAccessLogsBucket`
- **KMS encryption**: Use KMS encryption for sensitive data (pipeline artifacts)
- **Key rotation**: Enable `enableKeyRotation` on all KMS keys
- **Bucket policies**: Add explicit deny policies for unencrypted uploads when using KMS

### Testing Patterns

- Use `Template.fromStack()` for CDK assertions
- Test resource properties with `hasResourceProperties()`
- Test resource metadata (deletion policy, etc.) with `hasResource()`
- Use `Match.objectLike()` and `Match.arrayWith()` for partial matching
- Organize tests with `describe()` blocks per construct/stack
- One assertion per `test()` for clarity

## Git Conventions

- Do not reference AI assistants (Claude, Kiro, etc.) in commit messages
- Use Conventional Commits prefixes:
  - `build:` — changes to the build system or external dependencies
  - `chore:` — project tooling, config, scripts
  - `ci:` — CI/CD pipeline changes
  - `docs:` — documentation only
  - `feat:` — new user-facing feature
  - `fix:` — bug fix
  - `perf:` — performance improvement
  - `refactor:` — code restructuring with no behavior change
  - `revert:` — reverts a previous commit
  - `style:` — formatting changes that do not affect behavior
  - `test:` — adding or updating tests

## Security Findings (cdk-nag)

### Addressed in Code

**`AwsSolutions-S1`** — S3 buckets missing server access logging
- A shared `LoggingStack` provisions a dedicated server access logs bucket
- The pipeline artifacts bucket (`ArtifactsBucket`) and application bucket (`ApplicationStack`) both send access logs to that shared bucket
- Within `ApplicationStage`, a stage-local `LoggingStack` is deployed alongside `ApplicationStack` to keep cross-stack references within the same stage boundary

### Suppressed Findings

**`AwsSolutions-S1`** — Applied to the server access logs bucket itself in `LoggingStack`
- An access logs bucket cannot send its own access logs to itself without a circular dependency

**`AwsSolutions-CB4`** — Applied at the stack level in `DeliveryPipelineStack`
- CDK Pipelines creates CodeBuild projects internally (Synth, SelfMutation, asset publishing)
- `CodeBuildOptions` does not expose an `encryptionKey` property, so there is no API surface to set a KMS key on these projects directly

**`AwsSolutions-IAM5`** — Applied at the stack level in `DeliveryPipelineStack`
- CDK Pipelines and CodePipeline generate IAM policies with wildcard actions (e.g., `s3:GetObject*`, `s3:List*`) and wildcard resources
- These policies are produced entirely by CDK internals and cannot be further constrained through the available construct APIs

## Workflow

After each code change:
1. Run `npm run build` to type-check
2. Run `npm test` to verify tests pass
3. Run `npx cdk synth` to verify CDK synthesis and cdk-nag checks pass

Before committing:
- The pre-commit hook will automatically run `npm run build:ci` and `lint-staged`
- Ensure all tests pass and code is properly formatted

## Common Tasks

### Adding a New Stack

1. Create the stack file in the appropriate domain directory under `lib/`
2. Create a corresponding test file under `test/unit/` mirroring the structure
3. Instantiate the stack in `bin/aws-cdk-delivery-patterns.ts`
4. If the stack requires resources from other stacks, pass them via props
5. Add a `description` to the stack props
6. Run `npm run build:ci` to verify

### Adding a New Construct

1. Create the construct file in a subdirectory under the appropriate domain (e.g., `lib/pipeline/artifacts/`)
2. Export resources via readonly properties
3. Create a corresponding test file under `test/unit/` mirroring the structure
4. Use the construct in the appropriate stack
5. Run `npm run build:ci` to verify

### Addressing cdk-nag Findings

1. Run `npx cdk synth` to see findings
2. If the finding can be addressed in code, update the construct/stack
3. If the finding cannot be addressed (e.g., CDK internal limitations), add a suppression with `NagSuppressions.addResourceSuppressions()` or `NagSuppressions.addStackSuppressions()`
4. Always include a detailed `reason` explaining why the suppression is necessary
5. Run `npx cdk synth` again to verify the finding is suppressed

## Project Context

This project demonstrates:
- Self-mutating CDK Pipelines with CodeCommit source
- Shared logging infrastructure pattern
- Stage-local resource provisioning to maintain cross-stack references
- Security best practices with cdk-nag enforcement
- Custom pipeline artifacts bucket with KMS encryption
- Multi-environment deployment patterns (currently Dev stage)

The pipeline is triggered by pushing to the `main` branch of the CodeCommit repository.
