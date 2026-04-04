import { Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { DirectoryStack } from '../../../lib/directory/directory-stack.js';

describe('DirectoryStack', () => {
  const app = new cdk.App();
  const vpcStack = new cdk.Stack(app, 'VpcStack');
  const vpc = new ec2.Vpc(vpcStack, 'TestVpc', {
    natGateways: 0,
    subnetConfiguration: [
      {
        cidrMask: 24,
        name: 'Isolated',
        subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
      },
    ],
  });
  const subnets = vpc.selectSubnets({ subnetGroupName: 'Isolated' }).subnets;
  const stack = new DirectoryStack(app, 'TestDirectoryStack', { subnets, vpc });
  const template = Template.fromStack(stack);

  test('provisions a Microsoft AD directory', () => {
    template.resourceCountIs('AWS::DirectoryService::MicrosoftAD', 1);
  });

  test('stores the directory ID in SSM', () => {
    template.hasResourceProperties('AWS::SSM::Parameter', {
      Name: '/aws-cdk-delivery-patterns/directory-id',
      Type: 'String',
    });
  });
});
