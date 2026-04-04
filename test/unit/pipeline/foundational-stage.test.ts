import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { FoundationalStage } from '../../../lib/pipeline/foundational-stage.js';

describe('FoundationalStage', () => {
  const app = new cdk.App();
  const stage = new FoundationalStage(app, 'TestFoundationalStage', {});

  test('creates a logging stack', () => {
    const stack = stage.node.findChild(
      'AwsCdkDeliveryPatternsLoggingStack'
    ) as cdk.Stack;
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('creates a network stack', () => {
    const stack = stage.node.findChild(
      'AwsCdkDeliveryPatternsNetworkStack'
    ) as cdk.Stack;
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  test('creates a directory stack', () => {
    const stack = stage.node.findChild(
      'AwsCdkDeliveryPatternsDirectoryStack'
    ) as cdk.Stack;
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::DirectoryService::MicrosoftAD', 1);
  });
});
