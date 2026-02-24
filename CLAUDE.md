# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture

This is an AWS CDK TypeScript project. The CDK app is executed directly from TypeScript via `tsx` (no compile step needed at runtime).

- **`bin/aws-cdk-delivery-patterns.ts`** — CDK app entry point; instantiates stacks and passes them to `cdk.App`.
- **`lib/`** — CDK stack definitions, organized by domain:
  - **`lib/application/`** — `ApplicationStack` and `ApplicationStage`
  - **`lib/pipeline/`** — `DeliveryPipelineStack`
  - **`lib/repository/`** — `RepositoryStack`
- **`test/unit/`** — Vitest unit tests. CDK stack assertions use `aws-cdk-lib/assertions` (`Template.fromStack`).

`tsconfig.json` has `noEmit: true` — TypeScript is used for type-checking only. The CDK CLI runs the app via `npx tsx` (configured in `cdk.json`).

## Tooling

- **Linter/Formatter**: [Biome](https://biomejs.dev/) (not ESLint/Prettier). Single quotes, 2-space indent, trailing commas (ES5), 80-char line width.
- **Test runner**: Vitest (not Jest). Config is in `vite.config.unit.ts`. Tests live in `test/unit/`.
- **Commit convention**: Conventional Commits enforced via commitlint + husky.
- **Pre-commit hook**: Runs `npm run build:ci` (clean → test → tsc) and `lint-staged` (biome format + lint on staged files).

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

## TypeScript Conventions

- Always sort lists of field names alphabetically (interface properties, object literals, enum members, etc.)

## Git Conventions

- Do not reference Claude, Claude Code, or AI assistance in commit messages

## Workflow

- After each code change, run `npm run build` and `npm test` to verify nothing is broken
