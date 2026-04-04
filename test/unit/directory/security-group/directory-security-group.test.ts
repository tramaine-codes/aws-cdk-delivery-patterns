import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { DirectorySecurityGroup } from '../../../../lib/directory/security-group/directory-security-group.js';

describe('DirectorySecurityGroup', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');
  const vpc = new ec2.Vpc(stack, 'TestVpc', {
    natGateways: 0,
    subnetConfiguration: [
      {
        cidrMask: 24,
        name: 'Isolated',
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    ],
  });
  new DirectorySecurityGroup(stack, 'TestDirectorySecurityGroup', { vpc });
  const template = Template.fromStack(stack);

  test('creates a security group for domain-joined resources', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      GroupDescription:
        'Allows AD protocol traffic for domain-joined resources',
    });
  });

  test('allows egress on DNS port (TCP)', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({ FromPort: 53, IpProtocol: 'tcp', ToPort: 53 }),
      ]),
    });
  });

  test('allows egress on Kerberos port (TCP)', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({ FromPort: 88, IpProtocol: 'tcp', ToPort: 88 }),
      ]),
    });
  });

  test('allows egress on LDAP port (TCP)', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({ FromPort: 389, IpProtocol: 'tcp', ToPort: 389 }),
      ]),
    });
  });

  test('allows egress on LDAPS port', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({ FromPort: 636, IpProtocol: 'tcp', ToPort: 636 }),
      ]),
    });
  });

  test('allows egress on RPC dynamic ports', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({ FromPort: 49152, IpProtocol: 'tcp', ToPort: 65535 }),
      ]),
    });
  });

  test('restricts all egress rules to the VPC CIDR', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupEgress: Match.arrayWith([
        Match.objectLike({
          CidrIp: { 'Fn::GetAtt': Match.arrayWith(['CidrBlock']) },
        }),
      ]),
    });
  });
});
