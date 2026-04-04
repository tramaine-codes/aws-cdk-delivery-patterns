import type * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import { NetworkVpc } from './vpc/network-vpc.js';
import { VpcEndpoints } from './vpc-endpoints/vpc-endpoints.js';

export class NetworkStack extends cdk.Stack {
  readonly isolatedSubnets: ReadonlyArray<ec2.ISubnet>;
  readonly vpc: ec2.IVpc;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, {
      description:
        'Provisions the VPC and subnet infrastructure for CDK delivery patterns',
      ...props,
    });

    const { isolatedSubnets, vpc } = new NetworkVpc(this, 'Vpc');
    this.isolatedSubnets = isolatedSubnets;
    this.vpc = vpc;

    new VpcEndpoints(this, 'VpcEndpoints', { vpc });
  }
}
