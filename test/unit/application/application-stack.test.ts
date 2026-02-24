import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { ApplicationStack } from '../../../lib/application/application-stack.js';

describe('ApplicationStack', () => {
  const app = new cdk.App();
  const stack = new ApplicationStack(app, 'TestAppStack', {});
  const template = Template.fromStack(stack);

  test('creates an S3 bucket', () => {
    template.resourceCountIs('AWS::S3::Bucket', 1);
  });

  test('blocks all public access', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('enables S3-managed encryption', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256',
            },
          },
        ],
      },
    });
  });

  test('enables versioning', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: {
        Status: 'Enabled',
      },
    });
  });
});
