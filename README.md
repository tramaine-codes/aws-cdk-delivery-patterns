# aws-cdk-delivery-patterns

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
bin/        # CDK app entry point
lib/        # Stack definitions
test/
  unit/     # Vitest unit tests
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

## CDK Commands

```bash
# Synthesize CloudFormation template
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
| [Husky](https://typicode.github.io/husky/)               | Git hooks                                     |
| [commitlint](https://commitlint.js.org/)                 | Conventional Commits enforcement              |

## Contributing

Commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification, enforced via commitlint.
