import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import type { Construct } from 'constructs';

interface ApplicationStackProps extends cdk.StackProps {
  readonly serverAccessLogsBucket: s3.IBucket;
}

export class ApplicationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: ApplicationStackProps) {
    super(scope, id, {
      description: 'Provisions the application stack for CDK delivery patterns',
      ...props,
    });

    new s3.Bucket(this, 'ApplicationBucket', {
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      serverAccessLogsBucket: props.serverAccessLogsBucket,
      versioned: true,
    });
  }
}
