import type * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import { DomainJoinedInstance } from './domain-joined-instance/domain-joined-instance.js';

interface DomainJoinedInstanceStackProps extends cdk.StackProps {
  readonly subnets: ReadonlyArray<ec2.ISubnet>;
  readonly vpc: ec2.IVpc;
}

export class DomainJoinedInstanceStack extends cdk.Stack {
  constructor(
    scope: Construct,
    id: string,
    props: DomainJoinedInstanceStackProps
  ) {
    super(scope, id, {
      description:
        'Provisions a domain-joined Windows EC2 instance for AD authentication testing',
      ...props,
    });

    const { subnets, vpc } = props;

    new DomainJoinedInstance(this, 'DomainJoinedInstance', { subnets, vpc });
  }
}
