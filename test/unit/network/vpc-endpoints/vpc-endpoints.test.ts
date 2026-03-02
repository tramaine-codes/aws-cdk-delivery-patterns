import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { VpcEndpoints } from '../../../../lib/network/vpc-endpoints/vpc-endpoints.js';

describe('VpcEndpoints', () => {
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
  new VpcEndpoints(stack, 'TestVpcEndpoints', { vpc });
  const template = Template.fromStack(stack);

  test('creates an S3 gateway endpoint', () => {
    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      ServiceName: {
        'Fn::Join': ['', ['com.amazonaws.', { Ref: 'AWS::Region' }, '.s3']],
      },
      VpcEndpointType: 'Gateway',
    });
  });

  test('creates a KMS interface endpoint in isolated subnets', () => {
    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      PrivateDnsEnabled: true,
      ServiceName: {
        'Fn::Join': ['', ['com.amazonaws.', { Ref: 'AWS::Region' }, '.kms']],
      },
      VpcEndpointType: 'Interface',
    });
  });

  test('creates a CloudWatch Logs interface endpoint in isolated subnets', () => {
    template.hasResourceProperties('AWS::EC2::VPCEndpoint', {
      PrivateDnsEnabled: true,
      ServiceName: {
        'Fn::Join': ['', ['com.amazonaws.', { Ref: 'AWS::Region' }, '.logs']],
      },
      VpcEndpointType: 'Interface',
    });
  });

  test('creates an endpoint security group allowing HTTPS from the VPC CIDR', () => {
    template.hasResourceProperties('AWS::EC2::SecurityGroup', {
      SecurityGroupIngress: Match.arrayWith([
        Match.objectLike({
          CidrIp: { 'Fn::GetAtt': Match.arrayWith(['CidrBlock']) },
          FromPort: 443,
          IpProtocol: 'tcp',
          ToPort: 443,
        }),
      ]),
    });
  });
});
