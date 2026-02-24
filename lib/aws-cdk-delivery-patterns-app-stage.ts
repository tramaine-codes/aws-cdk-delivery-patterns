import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { AwsCdkDeliveryPatternsAppStack } from './aws-cdk-delivery-patterns-app-stack.js';

export class AwsCdkDeliveryPatternsAppStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props);

    new AwsCdkDeliveryPatternsAppStack(this, 'AwsCdkDeliveryPatternsAppStack', {
      env: props.env,
    });
  }
}
