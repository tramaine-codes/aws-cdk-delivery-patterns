#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { DeliveryPipelineStack } from '../lib/pipeline/delivery-pipeline-stack.js';
import { RepositoryStack } from '../lib/repository/repository-stack.js';

const app = new cdk.App();

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
