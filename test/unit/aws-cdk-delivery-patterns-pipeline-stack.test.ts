import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { AwsCdkDeliveryPatternsPipelineStack } from '../../lib/aws-cdk-delivery-patterns-pipeline-stack.js';
import { AwsCdkDeliveryPatternsRepositoryStack } from '../../lib/aws-cdk-delivery-patterns-repository-stack.js';

describe('AwsCdkDeliveryPatternsPipelineStack', () => {
  const app = new cdk.App();
  const { repository } = new AwsCdkDeliveryPatternsRepositoryStack(
    app,
    'TestRepositoryStack',
    {}
  );
  const stack = new AwsCdkDeliveryPatternsPipelineStack(
    app,
    'TestPipelineStack',
    { repository }
  );
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
});
