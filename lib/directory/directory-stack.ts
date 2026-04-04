import type * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import { MicrosoftAd } from './microsoft-ad/microsoft-ad.js';

interface DirectoryStackProps extends cdk.StackProps {
  readonly subnets: ReadonlyArray<ec2.ISubnet>;
  readonly vpc: ec2.IVpc;
}

export class DirectoryStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: DirectoryStackProps) {
    super(scope, id, {
      description:
        'Provisions the AWS Managed Microsoft AD for CDK delivery patterns',
      ...props,
    });

    const { subnets, vpc } = props;
    const { directoryId } = new MicrosoftAd(this, 'MicrosoftAd', {
      subnets,
      vpc,
    });

    new ssm.StringParameter(this, 'DirectoryIdParameter', {
      description: 'Directory ID for AWS Managed Microsoft AD',
      parameterName: '/aws-cdk-delivery-patterns/directory-id',
      stringValue: directoryId,
    });
  }
}
