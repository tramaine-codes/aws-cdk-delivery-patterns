import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';
import type { Construct } from 'constructs';

export class LoggingStack extends cdk.Stack {
  readonly serverAccessLogsBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: cdk.StackProps) {
    super(scope, id, {
      description:
        'Provisions shared logging infrastructure for CDK delivery patterns',
      ...props,
    });

    this.serverAccessLogsBucket = new s3.Bucket(
      this,
      'ServerAccessLogsBucket',
      {
        autoDeleteObjects: true,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
        encryption: s3.BucketEncryption.S3_MANAGED,
        enforceSSL: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    NagSuppressions.addResourceSuppressions(this.serverAccessLogsBucket, [
      {
        id: 'AwsSolutions-S1',
        reason:
          'Server access logs bucket does not require access logging to itself.',
      },
    ]);
  }
}
