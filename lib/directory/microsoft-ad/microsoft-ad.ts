import * as cdk from 'aws-cdk-lib';
import * as ds from 'aws-cdk-lib/aws-directoryservice';
import type * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';

interface MicrosoftAdProps {
  readonly subnets: ReadonlyArray<ec2.ISubnet>;
  readonly vpc: ec2.IVpc;
}

export class MicrosoftAd extends Construct {
  readonly directoryId: string;

  constructor(scope: Construct, id: string, props: MicrosoftAdProps) {
    super(scope, id);

    const { subnets, vpc } = props;

    const key = new kms.Key(this, 'Key', {
      alias: 'alias/aws-cdk-delivery-patterns/directory-admin',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const adminPassword = new secretsmanager.Secret(this, 'AdminPassword', {
      description: 'Administrator password for AWS Managed Microsoft AD',
      encryptionKey: key,
      generateSecretString: {
        excludeCharacters: '"@/\\',
        passwordLength: 32,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    NagSuppressions.addResourceSuppressions(adminPassword, [
      {
        id: 'AwsSolutions-SMG4',
        reason:
          'Automatic rotation for the AWS Managed Microsoft AD administrator password is not supported by the Directory Service.',
      },
    ]);

    const { ref } = new ds.CfnMicrosoftAD(this, 'Resource', {
      edition: 'Standard',
      name: 'corp.awscdkdelivery.internal',
      password: adminPassword.secretValue.unsafeUnwrap(),
      vpcSettings: {
        subnetIds: subnets.map((subnet) => subnet.subnetId),
        vpcId: vpc.vpcId,
      },
    });
    this.directoryId = ref;
  }
}
