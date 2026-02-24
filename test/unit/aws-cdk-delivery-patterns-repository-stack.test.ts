import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { AwsCdkDeliveryPatternsRepositoryStack } from '../../lib/aws-cdk-delivery-patterns-repository-stack.js';

describe('AwsCdkDeliveryPatternsRepositoryStack', () => {
  test('creates a CodeCommit repository', () => {
    const app = new cdk.App();
    const stack = new AwsCdkDeliveryPatternsRepositoryStack(
      app,
      'TestRepositoryStack',
      {}
    );
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::CodeCommit::Repository', {
      RepositoryName: 'aws-cdk-delivery-patterns',
    });
  });
});
