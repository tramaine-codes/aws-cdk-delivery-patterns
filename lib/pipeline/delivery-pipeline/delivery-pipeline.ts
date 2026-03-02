import type * as cdk from 'aws-cdk-lib';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import type * as codecommit from 'aws-cdk-lib/aws-codecommit';
import type * as s3 from 'aws-cdk-lib/aws-s3';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';

interface DeliveryPipelineProps {
  readonly artifactBucket: s3.IBucket;
  readonly repository: codecommit.IRepository;
  readonly stage: cdk.Stage;
}

export class DeliveryPipeline extends Construct {
  constructor(scope: Construct, id: string, props: DeliveryPipelineProps) {
    super(scope, id);

    const { artifactBucket, repository, stage } = props;

    const pipeline = new CodePipeline(this, 'Resource', {
      artifactBucket,
      pipelineName: 'AwsCdkDeliveryPatternsPipeline',
      selfMutation: true,
      selfMutationCodeBuildDefaults: {
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
              commands: ['npm install -g npm@11.11.0'],
            },
          },
        }),
      },
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.codeCommit(repository, 'main'),
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
              commands: ['npm install -g npm@11.11.0'],
            },
          },
        }),
      },
    });

    pipeline.addStage(stage);
  }
}
