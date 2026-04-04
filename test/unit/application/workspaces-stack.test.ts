import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { WorkspacesStack } from '../../../lib/application/workspaces-stack.js';

describe('WorkspacesStack', () => {
  const app = new cdk.App();
  const stack = new WorkspacesStack(app, 'TestWorkspacesStack', {
    bundleId: 'wsb-test12345',
  });
  const template = Template.fromStack(stack);

  test('provisions a WorkSpaces pool', () => {
    template.resourceCountIs('AWS::WorkSpaces::WorkspacesPool', 1);
  });
});
