import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';

export class AwsCdkDeliveryPatternsRepositoryStack extends cdk.Stack {
  readonly repository: codecommit.Repository;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      description:
        'Provisions the CodeCommit repository for CDK delivery patterns',
      ...props,
    });

    this.repository = new codecommit.Repository(
      this,
      'AwsCdkDeliveryPatternsRepositoryStack',
      {
        description: 'CDK delivery patterns and CI/CD prototyping',
        repositoryName: 'aws-cdk-delivery-patterns',
      }
    );
  }
}
