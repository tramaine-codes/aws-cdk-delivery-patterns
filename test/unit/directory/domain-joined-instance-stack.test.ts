import { Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { DomainJoinedInstanceStack } from '../../../lib/directory/domain-joined-instance-stack.js';

describe('DomainJoinedInstanceStack', () => {
  const app = new cdk.App();
  const vpcStack = new cdk.Stack(app, 'VpcStack');
  const vpc = new ec2.Vpc(vpcStack, 'TestVpc', {
    natGateways: 0,
    subnetConfiguration: [
      {
        cidrMask: 24,
        name: 'Private',
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    ],
  });
  const subnets = vpc.selectSubnets({
    subnetGroupName: 'Private',
  }).subnets;
  const stack = new DomainJoinedInstanceStack(
    app,
    'TestDomainJoinedInstanceStack',
    { subnets, vpc }
  );
  const template = Template.fromStack(stack);

  test('provisions a domain-joined Windows EC2 instance', () => {
    template.resourceCountIs('AWS::EC2::Instance', 1);
  });

  test('creates an SSM association for domain join', () => {
    template.resourceCountIs('AWS::SSM::Association', 1);
  });
});
