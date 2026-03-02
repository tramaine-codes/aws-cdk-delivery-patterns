import { Match, Template } from 'aws-cdk-lib/assertions';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { ArtifactsBucket } from '../../../../lib/pipeline/artifacts/artifacts-bucket.js';

describe('ArtifactsBucket', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');
  const serverAccessLogsBucket = new s3.Bucket(stack, 'TestLogsBucket');
  new ArtifactsBucket(stack, 'ArtifactsBucket', {
    serverAccessLogsBucket,
  });
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

  test('uses KMS encryption and deletes the bucket on stack removal', () => {
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
      Properties: Match.objectLike({
        BucketEncryption: Match.objectLike({
          ServerSideEncryptionConfiguration: Match.arrayWith([
            Match.objectLike({
              ServerSideEncryptionByDefault: Match.objectLike({
                SSEAlgorithm: 'aws:kms',
              }),
            }),
          ]),
        }),
      }),
    });
  });

  test('blocks all public access', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: Match.objectLike({
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({
            ServerSideEncryptionByDefault: Match.objectLike({
              SSEAlgorithm: 'aws:kms',
            }),
          }),
        ]),
      }),
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true,
      },
    });
  });

  test('sends access logs to the server access logs bucket', () => {
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: Match.objectLike({
        ServerSideEncryptionConfiguration: Match.arrayWith([
          Match.objectLike({
            ServerSideEncryptionByDefault: Match.objectLike({
              SSEAlgorithm: 'aws:kms',
            }),
          }),
        ]),
      }),
      LoggingConfiguration: {
        DestinationBucketName: Match.anyValue(),
      },
    });
  });

  test('denies PutObject requests that do not use the artifacts KMS key', () => {
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: Match.objectLike({
        Statement: Match.arrayWith([
          Match.objectLike({
            Action: 's3:PutObject',
            Condition: Match.objectLike({
              StringNotEqualsIfExists: Match.objectLike({
                's3:x-amz-server-side-encryption-aws-kms-key-id':
                  Match.anyValue(),
              }),
            }),
            Effect: 'Deny',
          }),
        ]),
      }),
    });
  });
});
