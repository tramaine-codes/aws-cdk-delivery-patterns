import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

interface ArtifactsBucketProps {
  readonly serverAccessLogsBucket: s3.IBucket;
}

export class ArtifactsBucket extends Construct {
  readonly bucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: ArtifactsBucketProps) {
    super(scope, id);

    const key = new kms.Key(this, 'Key', {
      alias: 'alias/aws-cdk-delivery-patterns/pipeline-artifacts',
      enableKeyRotation: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.bucket = new s3.Bucket(this, 'Resource', {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.KMS,
      encryptionKey: key,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      serverAccessLogsBucket: props.serverAccessLogsBucket,
    });

    this.bucket.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        conditions: {
          StringNotEqualsIfExists: {
            's3:x-amz-server-side-encryption-aws-kms-key-id': key.keyArn,
          },
        },
        effect: iam.Effect.DENY,
        principals: [new iam.AnyPrincipal()],
        resources: [this.bucket.arnForObjects('*')],
      })
    );
  }
}
