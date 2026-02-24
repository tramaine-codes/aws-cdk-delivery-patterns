import * as cdk from 'aws-cdk-lib';
import type * as codecommit from 'aws-cdk-lib/aws-codecommit';
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from 'aws-cdk-lib/pipelines';
import type { Construct } from 'constructs';
import { AwsCdkDeliveryPatternsAppStage } from './aws-cdk-delivery-patterns-app-stage.js';

interface AwsCdkDeliveryPatternsPipelineStackProps extends cdk.StackProps {
  readonly repository: codecommit.IRepository;
}

export class AwsCdkDeliveryPatternsPipelineStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: AwsCdkDeliveryPatternsPipelineStackProps
  ) {
    super(scope, id, {
      description: 'Provisions the pipeline for CDK delivery patterns',
      ...props,
    });

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'AwsCdkDeliveryPatternsPipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.codeCommit(props.repository, 'main'),
        commands: ['npm ci', 'npm run build', 'npx cdk synth'],
      }),
    });
    const stage = new AwsCdkDeliveryPatternsAppStage(this, 'Dev', {
      env: props.env,
    });

    pipeline.addStage(stage);
  }
}
