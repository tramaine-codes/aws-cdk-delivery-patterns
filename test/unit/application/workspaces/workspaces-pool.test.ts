import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { WorkspacesPool } from '../../../../lib/application/workspaces/workspaces-pool.js';

describe('WorkspacesPool', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');
  new WorkspacesPool(stack, 'TestWorkspacesPool', {
    bundleId: 'wsb-test12345',
  });
  const template = Template.fromStack(stack);

  test('creates a WorkSpaces pool', () => {
    template.resourceCountIs('AWS::WorkSpaces::WorkspacesPool', 1);
  });

  test('uses the provided bundle', () => {
    template.hasResourceProperties('AWS::WorkSpaces::WorkspacesPool', {
      BundleId: 'wsb-test12345',
    });
  });

  test('resolves the directory ID from SSM', () => {
    template.hasResourceProperties('AWS::WorkSpaces::WorkspacesPool', {
      DirectoryId: {
        Ref: Match.stringLikeRegexp('SsmParameterValue'),
      },
    });
  });

  test('sets initial capacity to 1 desired user session', () => {
    template.hasResourceProperties('AWS::WorkSpaces::WorkspacesPool', {
      Capacity: { DesiredUserSessions: 1 },
    });
  });

  test('configures session timeout settings', () => {
    template.hasResourceProperties('AWS::WorkSpaces::WorkspacesPool', {
      TimeoutSettings: {
        DisconnectTimeoutInSeconds: 3600,
        IdleDisconnectTimeoutInSeconds: 900,
        MaxUserDurationInSeconds: 28800,
      },
    });
  });
});
