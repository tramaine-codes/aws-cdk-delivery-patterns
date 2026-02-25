import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';

export class ArtifactsKey extends Construct {
  readonly key: kms.IKey;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.key = new kms.Key(this, 'Resource', {
      alias: 'alias/aws-cdk-delivery-patterns/pipeline-artifacts',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
  }
}
