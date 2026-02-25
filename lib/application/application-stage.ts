import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { LoggingStack } from '../logging/logging-stack.js';
import { ApplicationStack } from './application-stack.js';

export class ApplicationStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props);

    const { serverAccessLogsBucket } = new LoggingStack(
      this,
      'AwsCdkDeliveryPatternsLoggingStack',
      { env: props.env }
    );

    new ApplicationStack(this, 'AwsCdkDeliveryPatternsApplicationStack', {
      env: props.env,
      serverAccessLogsBucket,
    });
  }
}
