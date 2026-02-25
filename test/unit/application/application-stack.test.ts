import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { LoggingStack } from '../../../lib/logging/logging-stack.js';
import { ApplicationStack } from '../../../lib/application/application-stack.js';

describe('ApplicationStack', () => {
  const app = new cdk.App();
  const { serverAccessLogsBucket } = new LoggingStack(
    app,
    'TestLoggingStack',
    {}
  );
  const stack = new ApplicationStack(app, 'TestAppStack', {
    serverAccessLogsBucket,
  });
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

  test('enforces SSL', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 's3:*',
            Condition: {
              Bool: { 'aws:SecureTransport': 'false' },
            },
            Effect: 'Deny',
          }),
        ]),
      }),
    });
  });

  test('enables versioning', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      VersioningConfiguration: {
        Status: 'Enabled',
      },
    });
  });

  test('sends access logs to the shared server access logs bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      LoggingConfiguration: {
        DestinationBucketName: Match.anyValue(),
      },
    });
  });
});
