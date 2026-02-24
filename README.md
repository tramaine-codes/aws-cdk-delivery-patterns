# aws-cdk-delivery-patterns

[![GitHub](https://img.shields.io/badge/GitHub-tramaine--codes%2Faws--cdk--delivery--patterns-blue?logo=github)](https://github.com/tramaine-codes/aws-cdk-delivery-patterns)

An AWS CDK project written in TypeScript for exploring and implementing cloud delivery patterns on AWS.

## Prerequisites

- [Node.js](https://nodejs.org/) v24 — version pinned in `package.json` (Volta) and `.nvmrc` (NVM)
- [AWS CDK CLI](https://docs.aws.amazon.com/cdk/v2/guide/getting_started.html): `npm install -g aws-cdk`
- AWS credentials configured (via `~/.aws/credentials`, environment variables, or IAM role)

## Getting Started

```bash
# Install dependencies
npm install

# Bootstrap your AWS environment (first-time only)
npx cdk bootstrap
```

## Project Structure

```
bin/                  # CDK app entry point
lib/
  application/        # ApplicationStack and ApplicationStage
  pipeline/           # DeliveryPipelineStack
  repository/         # RepositoryStack
test/
  unit/               # Vitest unit tests
```

## Tooling Configuration

| File                     | Purpose                               |
| ------------------------ | ------------------------------------- |
| `biome.json`             | Biome linter/formatter configuration  |
| `cdk.json`               | CDK toolkit configuration             |
| `CLAUDE.md`              | Claude Code instructions              |
| `commitlint.config.ts`   | Conventional Commits rules            |
| `lint-staged.config.js`  | Staged file lint/format configuration |
| `tsconfig.json`          | TypeScript configuration (noEmit)     |
| `vite.config.unit.ts`    | Vitest configuration                  |

## Development

```bash
# Type-check (no JS output)
npm run build

# Watch mode
npm run watch

# Lint
npm run lint

# Lint with auto-fix
npm run lint:fix

# Format
npm run format
```

## Testing

```bash
# Run unit tests
npm test

# Run unit tests in watch mode
npm run test:watch

# Run a single test file
npx vitest run --dir test/unit --config ./vite.config.unit.ts test/unit/<filename>.test.ts

# Run tests with coverage
npm run test:cov
```

## Source Control

This repository is mirrored across two remotes:

| Remote       | URL                                                                                 |
| ------------ | ----------------------------------------------------------------------------------- |
| `origin`     | `git@github.com:tramaine-codes/aws-cdk-delivery-patterns.git`                       |
| `codecommit` | `https://git-codecommit.us-east-1.amazonaws.com/v1/repos/aws-cdk-delivery-patterns` |

### CodeCommit Setup

The `RepositoryStack` CDK stack provisions the CodeCommit repository. Deploy it before configuring the remote:

```bash
npx cdk deploy AwsCdkDeliveryPatternsRepositoryStack
```

Authentication uses the AWS CLI CodeCommit credential helper. Add the following to your global git config (`~/.gitconfig`):

```ini
[credential]
  helper = !aws codecommit credential-helper $@
```

On macOS, also configure the CodeCommit URL to use only the AWS credential helper, preventing Keychain from intercepting or caching credentials:

```bash
git config --global credential.https://git-codecommit.us-east-1.amazonaws.com.helper ""
git config --global --add credential.https://git-codecommit.us-east-1.amazonaws.com.helper "!aws codecommit credential-helper"
```

The empty string clears any inherited global helpers for that URL, and the second command adds the AWS helper as the sole credential provider.

Then add the remote:

```bash
git remote add codecommit https://git-codecommit.us-east-1.amazonaws.com/v1/repos/aws-cdk-delivery-patterns
```

### Pushing to CodeCommit

```bash
git push codecommit main
```

### Troubleshooting: 403 on Push

If you get a 403 error when pushing to CodeCommit, macOS Keychain may have cached stale credentials. Clear them with:

```bash
printf "protocol=https\nhost=git-codecommit.us-east-1.amazonaws.com\n" | git credential-osxkeychain erase
```

Then retry the push.

## Security Checks (cdk-nag)

[cdk-nag](https://github.com/cdklabs/cdk-nag) runs `AwsSolutionsChecks` during synthesis (`npx cdk synth`). Synthesis fails if any unaddressed violations are found.

### Findings addressed in code

**`AwsSolutions-S1`** — Pipeline artifacts bucket missing server access logging. Fixed by creating a dedicated access logs bucket and passing it as `serverAccessLogsBucket` on a custom `artifactBucket` provided to `CodePipeline`. The CDK Pipelines-generated bucket does not support access logging configuration, so a custom bucket is required.

### Findings suppressed

Suppressions are applied at the stack level via `NagSuppressions.addStackSuppressions` in `DeliveryPipelineStack`.

**`AwsSolutions-CB4`** — CDK Pipelines creates CodeBuild projects internally (Synth, SelfMutation, asset publishing). `CodeBuildOptions` does not expose an `encryptionKey` property, so there is no API surface to set a KMS key on these projects directly.

**`AwsSolutions-IAM5`** — CDK Pipelines and CodePipeline generate IAM policies with wildcard actions (e.g. `s3:GetObject*`, `s3:List*`) and wildcard resources on the pipeline role, CodeBuild roles, and the CodeCommit action role. These policies are produced entirely by CDK internals and cannot be further constrained through the available construct APIs.

## CDK Commands

```bash
# Synthesize CloudFormation template (also runs cdk-nag checks)
npx cdk synth

# Compare deployed stack with current state
npx cdk diff

# Deploy stack to your default AWS account/region
npx cdk deploy
```

## CI

```bash
# Full CI build: clean → test → type-check
npm run build:ci
```

The pre-commit hook runs `npm run build:ci` and `lint-staged` (Biome format + lint on staged files) automatically via Husky.

## Tooling

| Tool                                                     | Purpose                                       |
| -------------------------------------------------------- | --------------------------------------------- |
| [AWS CDK v2](https://docs.aws.amazon.com/cdk/v2/guide/)  | Infrastructure as code                        |
| [TypeScript](https://www.typescriptlang.org/)            | Language (type-check only; runtime via `tsx`) |
| [Vitest](https://vitest.dev/)                            | Unit test runner                              |
| [Biome](https://biomejs.dev/)                            | Linter and formatter                          |
| [cdk-nag](https://github.com/cdklabs/cdk-nag)           | CDK security and compliance checks            |
| [Husky](https://typicode.github.io/husky/)               | Git hooks                                     |
| [commitlint](https://commitlint.js.org/)                 | Conventional Commits enforcement              |

## Contributing

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, enforced via commitlint.
