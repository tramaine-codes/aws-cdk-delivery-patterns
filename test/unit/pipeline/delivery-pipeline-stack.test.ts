import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, expect, test } from 'vitest';
import { DeliveryPipelineStack } from '../../../lib/pipeline/delivery-pipeline-stack.js';
import { RepositoryStack } from '../../../lib/repository/repository-stack.js';

describe('DeliveryPipelineStack', () => {
  const app = new cdk.App();
  const { repository } = new RepositoryStack(app, 'TestRepositoryStack', {});
  const stack = new DeliveryPipelineStack(app, 'TestPipelineStack', {
    repository,
  });
  const template = Template.fromStack(stack);

  test('creates a CodePipeline pipeline', () => {
    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
      Name: 'AwsCdkDeliveryPatternsPipeline',
    });
  });

  test('sources from the CodeCommit repository', () => {
    template.hasResourceProperties('AWS::CodePipeline::Pipeline', {
      Stages: Match.arrayWith([
        Match.objectLike({
          Actions: Match.arrayWith([
            Match.objectLike({
              ActionTypeId: Match.objectLike({
                Category: 'Source',
                Owner: 'AWS',
                Provider: 'CodeCommit',
              }),
            }),
          ]),
          Name: 'Source',
        }),
      ]),
    });
  });

  test('runs synth commands', () => {
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Source: Match.objectLike({
        BuildSpec: Match.stringLikeRegexp('npm ci'),
      }),
    });
  });

  test('uses the standard 7.0 build image for the synth and self-mutation steps', () => {
    const projects = template.findResources('AWS::CodeBuild::Project', {
      Properties: {
        Environment: Match.objectLike({
          Image: 'aws/codebuild/standard:7.0',
        }),
      },
    });

    expect(Object.keys(projects).length).toBeGreaterThanOrEqual(2);
  });

  test('sets Node 24 as the runtime version for the self-mutation step', () => {
    const projects = template.findResources('AWS::CodeBuild::Project', {
      Properties: {
        Source: Match.objectLike({
          BuildSpec: Match.stringLikeRegexp('"nodejs": 24'),
        }),
      },
    });

    expect(Object.keys(projects).length).toBeGreaterThanOrEqual(2);
  });

  test('schedules the KMS key for deletion on stack removal', () => {
    template.hasResource('AWS::KMS::Key', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });
  });

  test('deletes the artifacts bucket on stack removal', () => {
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

  test('deletes the access logs bucket on stack removal', () => {
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
      Properties: Match.objectLike({
        BucketEncryption: Match.objectLike({
          ServerSideEncryptionConfiguration: Match.arrayWith([
            Match.objectLike({
              ServerSideEncryptionByDefault: Match.objectLike({
                SSEAlgorithm: 'AES256',
              }),
            }),
          ]),
        }),
      }),
    });
  });

  test('installs npm 11.10.1', () => {
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Source: Match.objectLike({
        BuildSpec: Match.stringLikeRegexp('npm install -g npm@11.10.1'),
      }),
    });
  });
});
