import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { ApplicationStack } from './application-stack.js';

export class ApplicationStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props);

    new ApplicationStack(this, 'AwsCdkDeliveryPatternsApplicationStack', {
      env: props.env,
    });
  }
}
