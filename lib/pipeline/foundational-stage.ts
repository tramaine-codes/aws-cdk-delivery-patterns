import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { LoggingStack } from '../logging/logging-stack.js';
import { NetworkStack } from '../network/network-stack.js';

export class FoundationalStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props);

    new LoggingStack(this, 'AwsCdkDeliveryPatternsLoggingStack', {
      env: props.env,
    });

    new NetworkStack(this, 'AwsCdkDeliveryPatternsNetworkStack', {
      env: props.env,
    });
  }
}
