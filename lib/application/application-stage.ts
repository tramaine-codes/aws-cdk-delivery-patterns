import * as cdk from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import { LoggingStack } from '../logging/logging-stack.js';
import { ApplicationStack } from './application-stack.js';
import { WorkspacesStack } from './workspaces-stack.js';

interface ApplicationStageProps extends cdk.StageProps {
  readonly bundleId: string;
}

export class ApplicationStage extends cdk.Stage {
  constructor(scope: Construct, id: string, props: ApplicationStageProps) {
    super(scope, id, props);

    const { bundleId, env } = props;

    const { serverAccessLogsBucket } = new LoggingStack(
      this,
      'AwsCdkDeliveryPatternsLoggingStack',
      { env }
    );

    new ApplicationStack(this, 'AwsCdkDeliveryPatternsApplicationStack', {
      env,
      serverAccessLogsBucket,
    });

    new WorkspacesStack(this, 'AwsCdkDeliveryPatternsWorkspacesStack', {
      bundleId,
      env,
    });
  }
}
