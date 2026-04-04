import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib/core';
import { describe, test } from 'vitest';
import { MicrosoftAd } from '../../../../lib/directory/microsoft-ad/microsoft-ad.js';

describe('MicrosoftAd', () => {
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
  const subnets = vpc.selectSubnets({ subnetGroupName: 'Isolated' }).subnets;
  new MicrosoftAd(stack, 'TestMicrosoftAd', { subnets, vpc });
  const template = Template.fromStack(stack);

  test('creates a KMS key with an alias for the admin password', () => {
    template.hasResourceProperties('AWS::KMS::Alias', {
      AliasName: 'alias/aws-cdk-delivery-patterns/directory-admin',
    });
  });

  test('enables key rotation', () => {
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: true,
    });
  });

  test('schedules the key for deletion on stack removal', () => {
    template.hasResource('AWS::KMS::Key', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete',
    });
  });

  test('creates an encrypted secret for the admin password', () => {
    template.hasResourceProperties('AWS::SecretsManager::Secret', {
      GenerateSecretString: Match.objectLike({
        ExcludeCharacters: '"@/\\',
        PasswordLength: 32,
      }),
    });
  });

  test('provisions a Standard edition Microsoft AD', () => {
    template.hasResourceProperties('AWS::DirectoryService::MicrosoftAD', {
      Edition: 'Standard',
      Name: 'corp.awscdkdelivery.internal',
    });
  });

  test('places the directory in the VPC with isolated subnets', () => {
    template.hasResourceProperties('AWS::DirectoryService::MicrosoftAD', {
      VpcSettings: Match.objectLike({
        SubnetIds: Match.anyValue(),
        VpcId: Match.anyValue(),
      }),
    });
  });
});
