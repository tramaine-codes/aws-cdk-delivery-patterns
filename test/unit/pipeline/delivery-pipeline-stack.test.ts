import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
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

  test('uses the standard 7.0 build image', () => {
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Environment: Match.objectLike({
        Image: 'aws/codebuild/standard:7.0',
      }),
    });
  });

  test('sets Node 24 as the runtime version', () => {
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Source: Match.objectLike({
        BuildSpec: Match.stringLikeRegexp('"nodejs": 24'),
      }),
    });
  });

  test('installs npm 11.8.0', () => {
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Source: Match.objectLike({
        BuildSpec: Match.stringLikeRegexp('npm install -g npm@11.8.0'),
      }),
    });
  });
});
