import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { AwsCdkDeliveryPatternsAppStage } from '../../lib/aws-cdk-delivery-patterns-app-stage.js';

describe('AwsCdkDeliveryPatternsAppStage', () => {
  test('creates an app stack', () => {
    const app = new cdk.App();
    const stage = new AwsCdkDeliveryPatternsAppStage(app, 'TestAppStage', {});
    const stack = stage.node.findChild(
      'AwsCdkDeliveryPatternsAppStack'
    ) as cdk.Stack;
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::S3::Bucket', 1);
  });
});
