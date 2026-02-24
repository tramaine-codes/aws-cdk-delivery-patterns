#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { AwsCdkDeliveryPatternsRepositoryStack } from '../lib/aws-cdk-delivery-patterns-repository-stack.js';

const app = new cdk.App();
new AwsCdkDeliveryPatternsRepositoryStack(
  app,
  'AwsCdkDeliveryPatternsRepositoryStack',
  {
    env: {
      account: process.env.CDK_DEFAULT_ACCOUNT,
      region: 'us-east-1',
    },
  }
);
