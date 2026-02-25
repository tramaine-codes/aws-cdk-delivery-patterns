import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import type * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface ArtifactsBucketProps {
  readonly artifactsKey: kms.IKey;
  readonly serverAccessLogsBucket: s3.IBucket;
}

export class ArtifactsBucket extends Construct {
  readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: ArtifactsBucketProps) {
    super(scope, id);

    this.bucket = new s3.Bucket(this, 'Resource', {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: props.artifactsKey,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      serverAccessLogsBucket: props.serverAccessLogsBucket,
    });

    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        conditions: {
          StringNotEqualsIfExists: {
            's3:x-amz-server-side-encryption-aws-kms-key-id':
              props.artifactsKey.keyArn,
          },
        },
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        resources: [this.bucket.arnForObjects('*')],
      })
    );
  }
}
