import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { RepositoryStack } from '../../../lib/repository/repository-stack.js';

describe('RepositoryStack', () => {
  test('creates a CodeCommit repository', () => {
    const app = new cdk.App();
    const stack = new RepositoryStack(app, 'TestRepositoryStack', {});
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::CodeCommit::Repository', {
      RepositoryName: 'aws-cdk-delivery-patterns',
    });
  });
});
