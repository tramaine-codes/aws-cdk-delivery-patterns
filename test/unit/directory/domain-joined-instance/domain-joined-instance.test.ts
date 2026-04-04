import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { DomainJoinedInstance } from '../../../../lib/directory/domain-joined-instance/domain-joined-instance.js';

describe('DomainJoinedInstance', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');
  const vpc = new ec2.Vpc(stack, 'TestVpc', {
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
  new DomainJoinedInstance(stack, 'TestDomainJoinedInstance', {
    subnets,
    vpc,
  });
  const template = Template.fromStack(stack);

  test('creates a Windows EC2 instance', () => {
    template.resourceCountIs('AWS::EC2::Instance', 1);
  });

  test('uses an encrypted EBS volume', () => {
    template.hasResourceProperties('AWS::EC2::Instance', {
      BlockDeviceMappings: Match.arrayWith([
        Match.objectLike({
          Ebs: Match.objectLike({ Encrypted: true }),
        }),
      ]),
    });
  });

  test('creates an IAM role with SSM and directory service policies', () => {
    template.hasResourceProperties('AWS::IAM::Role', {
      ManagedPolicyArns: Match.arrayWith([
        {
          'Fn::Join': Match.arrayWith([
            Match.arrayWith([
              'arn:',
              ':iam::aws:policy/AmazonSSMDirectoryServiceAccess',
            ]),
          ]),
        },
        {
          'Fn::Join': Match.arrayWith([
            Match.arrayWith([
              'arn:',
              ':iam::aws:policy/AmazonSSMManagedInstanceCore',
            ]),
          ]),
        },
      ]),
    });
  });

  test('creates a security group with HTTPS egress for SSM', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({
          FromPort: 443,
          IpProtocol: 'tcp',
          ToPort: 443,
        }),
      ]),
    });
  });

  test('creates an AD security group for domain traffic', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupDescription:
        'Allows AD protocol traffic for domain-joined resources',
    });
  });

  test('creates an SSM association for domain join', () => {
    template.hasResourceProperties('AWS::SSM::Association', {
      Name: 'AWS-JoinDirectoryServiceDomain',
      Parameters: {
        directoryName: ['corp.awscdkdelivery.internal'],
      },
    });
  });
});
