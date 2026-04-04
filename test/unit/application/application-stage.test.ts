import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { ApplicationStage } from '../../../lib/application/application-stage.js';

describe('ApplicationStage', () => {
  const app = new cdk.App();
  const stage = new ApplicationStage(app, 'TestAppStage', {});

  test('creates an application stack', () => {
    const stack = stage.node.findChild(
      'AwsCdkDeliveryPatternsApplicationStack'
    ) as cdk.Stack;
    const template = Template.fromStack(stack);

    template.resourceCountIs('AWS::S3::Bucket', 1);
  });
});
