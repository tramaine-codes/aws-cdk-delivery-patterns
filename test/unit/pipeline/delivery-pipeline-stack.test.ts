import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, expect, test } from 'vitest';
import { LoggingStack } from '../../../lib/logging/logging-stack.js';
import { DeliveryPipelineStack } from '../../../lib/pipeline/delivery-pipeline-stack.js';
import { RepositoryStack } from '../../../lib/repository/repository-stack.js';

describe('DeliveryPipelineStack', () => {
  const app = new cdk.App();
  const { serverAccessLogsBucket } = new LoggingStack(
    app,
    'TestLoggingStack',
    {}
  );
  const { repository } = new RepositoryStack(app, 'TestRepositoryStack', {});
  const stack = new DeliveryPipelineStack(app, 'TestPipelineStack', {
    repository,
    serverAccessLogsBucket,
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

  test('installs npm 11.10.1', () => {
    template.hasResourceProperties('AWS::CodeBuild::Project', {
      Source: Match.objectLike({
        BuildSpec: Match.stringLikeRegexp('npm install -g npm@11.10.1'),
      }),
    });
  });
});
