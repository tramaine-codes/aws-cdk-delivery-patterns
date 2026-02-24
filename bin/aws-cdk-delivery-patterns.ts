#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AwsCdkDeliveryPatternsPipelineStack } from '../lib/aws-cdk-delivery-patterns-pipeline-stack.js';
import { AwsCdkDeliveryPatternsRepositoryStack } from '../lib/aws-cdk-delivery-patterns-repository-stack.js';

const app = new cdk.App();

const { repository } = new AwsCdkDeliveryPatternsRepositoryStack(
  app,
  'AwsCdkDeliveryPatternsRepositoryStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'us-east-1',
    },
  }
);

new AwsCdkDeliveryPatternsPipelineStack(
  app,
  'AwsCdkDeliveryPatternsPipelineStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'us-east-1',
    },
    repository,
  }
);
