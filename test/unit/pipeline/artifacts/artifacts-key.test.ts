import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { ArtifactsKey } from '../../../../lib/pipeline/artifacts/artifacts-key.js';

describe('ArtifactsKey', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');
  new ArtifactsKey(stack, 'ArtifactsKey');
  const template = Template.fromStack(stack);

  test('creates a KMS key with an alias for pipeline artifacts', () => {
    template.hasResourceProperties('AWS::KMS::Alias', {
      AliasName: 'alias/aws-cdk-delivery-patterns/pipeline-artifacts',
    });
  });

  test('enables key rotation', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: true,
    });
  });

  test('schedules the key for deletion on stack removal', () => {
    template.hasResource('AWS::KMS::Key', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });
  });
});
