import { Match, Template } from 'aws-cdk-lib/assertions';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import { describe, expect, test } from 'vitest';
import { ApplicationStage } from '../../../../lib/application/application-stage.js';
import { DeliveryPipeline } from '../../../../lib/pipeline/delivery-pipeline/delivery-pipeline.js';
import { FoundationalStage } from '../../../../lib/pipeline/foundational-stage.js';
import { RepositoryStack } from '../../../../lib/repository/repository-stack.js';

describe('DeliveryPipeline', () => {
  const app = new cdk.App();
  const { repository } = new RepositoryStack(app, 'TestRepositoryStack', {});
  const stack = new cdk.Stack(app, 'TestStack');
  const artifactBucket = new s3.Bucket(stack, 'TestArtifactBucket');
  new DeliveryPipeline(stack, 'Pipeline', {
    applicationStage: new ApplicationStage(stack, 'Dev', {
      bundleId: 'wsb-test12345',
    }),
    artifactBucket,
    foundationalStage: new FoundationalStage(stack, 'Foundational', {}),
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

  test('installs npm 11.11.0', () => {
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Source: Match.objectLike({
        BuildSpec: Match.stringLikeRegexp('npm install -g npm@11.11.0'),
      }),
    });
  });
});
