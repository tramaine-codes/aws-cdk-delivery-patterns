import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import { WorkspacesPool } from './workspaces/workspaces-pool.js';

interface WorkspacesStackProps extends cdk.StackProps {
  readonly bundleId: string;
}

export class WorkspacesStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: WorkspacesStackProps) {
    super(scope, id, {
      description: 'Provisions WorkSpaces Pools for CDK delivery patterns',
      ...props,
    });

    const { bundleId } = props;
    new WorkspacesPool(this, 'WorkspacesPool', { bundleId });
  }
}
