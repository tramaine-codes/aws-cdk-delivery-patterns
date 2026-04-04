import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as workspaces from 'aws-cdk-lib/aws-workspaces';
import { Construct } from 'constructs';

interface WorkspacesPoolProps {
  readonly bundleId: string;
}

export class WorkspacesPool extends Construct {
  constructor(scope: Construct, id: string, props: WorkspacesPoolProps) {
    super(scope, id);

    const { bundleId } = props;
    const directoryId = ssm.StringParameter.valueForStringParameter(
      this,
      '/aws-cdk-delivery-patterns/directory-id'
    );

    new workspaces.CfnWorkspacesPool(this, 'Resource', {
      bundleId,
      capacity: {
        desiredUserSessions: 1,
      },
      directoryId,
      poolName: 'AwsCdkDeliveryPatternsPool',
      timeoutSettings: {
        disconnectTimeoutInSeconds: 3600,
        idleDisconnectTimeoutInSeconds: 900,
        maxUserDurationInSeconds: 28800,
      },
    });
  }
}
