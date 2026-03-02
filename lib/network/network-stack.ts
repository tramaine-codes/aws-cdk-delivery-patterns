import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import { NetworkVpc } from './vpc/network-vpc.js';
import { VpcEndpoints } from './vpc-endpoints/vpc-endpoints.js';

export class NetworkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, {
      description:
        'Provisions the VPC and subnet infrastructure for CDK delivery patterns',
      ...props,
    });

    const { vpc } = new NetworkVpc(this, 'Vpc');
    new VpcEndpoints(this, 'VpcEndpoints', { vpc });
  }
}
