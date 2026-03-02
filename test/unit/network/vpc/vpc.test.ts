import { Match, Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { NetworkVpc } from '../../../../lib/network/vpc/network-vpc.js';

describe('NetworkVpc', () => {
  const app = new cdk.App();
  const stack = new cdk.Stack(app, 'TestStack');
  new NetworkVpc(stack, 'TestNetworkVpc');
  const template = Template.fromStack(stack);

  test('creates a VPC', () => {
    template.resourceCountIs('AWS::EC2::VPC', 1);
  });

  test('uses an explicit CIDR block', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      CidrBlock: '10.0.0.0/16',
    });
  });

  test('enables DNS hostnames and support', () => {
    template.hasResourceProperties('AWS::EC2::VPC', {
      EnableDnsHostnames: true,
      EnableDnsSupport: true,
    });
  });

  test('configures 2 AZs', () => {
    template.resourceCountIs('AWS::EC2::Subnet', 4);
  });

  test('creates private subnets', () => {
    template.hasResourceProperties('AWS::EC2::Subnet', {
      CidrBlock: Match.stringLikeRegexp('/24$'),
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'aws-cdk:subnet-name', Value: 'Private' }),
      ]),
    });
  });

  test('creates isolated subnets', () => {
    template.hasResourceProperties('AWS::EC2::Subnet', {
      CidrBlock: Match.stringLikeRegexp('/24$'),
      Tags: Match.arrayWith([
        Match.objectLike({ Key: 'aws-cdk:subnet-name', Value: 'Isolated' }),
      ]),
    });
  });
});
