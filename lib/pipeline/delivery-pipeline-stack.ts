import * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import type * as codecommit from 'aws-cdk-lib/aws-codecommit';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import type { Construct } from 'constructs';
import { ApplicationStage } from '../application/application-stage.js';

interface DeliveryPipelineStackProps extends cdk.StackProps {
  readonly repository: codecommit.IRepository;
}

export class DeliveryPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DeliveryPipelineStackProps) {
    super(scope, id, {
      description: 'Provisions the pipeline for CDK delivery patterns',
      ...props,
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'AwsCdkDeliveryPatternsPipeline',
      selfMutation: true,
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.codeCommit(props.repository, 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
      synthCodeBuildDefaults: {
        buildEnvironment: {
          buildImage: codebuild.LinuxBuildImage.STANDARD_7_0,
        },
        partialBuildSpec: codebuild.BuildSpec.fromObject({
          version: 0.2,
          phases: {
            install: {
              'runtime-versions': {
                nodejs: 24,
              },
              commands: ['npm install -g npm@11.8.0'],
            },
          },
        }),
      },
    });
    const stage = new ApplicationStage(this, 'Dev', {
      env: props.env,
    });

    pipeline.addStage(stage);
  }
}
