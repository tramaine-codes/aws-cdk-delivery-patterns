import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { DirectoryStack } from '../directory/directory-stack.js';
import { DomainJoinedInstanceStack } from '../directory/domain-joined-instance-stack.js';
import { LoggingStack } from '../logging/logging-stack.js';
import { NetworkStack } from '../network/network-stack.js';

export class FoundationalStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: cdk.StageProps) {
    super(scope, id, props);

    const { env } = props;
    const { isolatedSubnets, privateSubnets, vpc } = new NetworkStack(
      this,
      'AwsCdkDeliveryPatternsNetworkStack',
      { env }
    );

    new LoggingStack(this, 'AwsCdkDeliveryPatternsLoggingStack', {
      env,
    });

    new DirectoryStack(this, 'AwsCdkDeliveryPatternsDirectoryStack', {
      env,
      subnets: isolatedSubnets,
      vpc,
    });

    new DomainJoinedInstanceStack(
      this,
      'AwsCdkDeliveryPatternsDomainJoinedInstanceStack',
      {
        env,
        subnets: privateSubnets,
        vpc,
      }
    );
  }
}
