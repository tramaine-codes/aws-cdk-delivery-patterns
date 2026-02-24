#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AwsSolutionsChecks } from 'cdk-nag';
import { DeliveryPipelineStack } from '../lib/pipeline/delivery-pipeline-stack.js';
import { RepositoryStack } from '../lib/repository/repository-stack.js';

const app = new cdk.App();
cdk.Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

const { repository } = new RepositoryStack(
  app,
  'AwsCdkDeliveryPatternsRepositoryStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'us-east-1',
    },
  }
);

new DeliveryPipelineStack(app, 'AwsCdkDeliveryPatternsPipelineStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: 'us-east-1',
  },
  repository,
});
