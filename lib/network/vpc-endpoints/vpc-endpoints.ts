import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface VpcEndpointsProps {
  readonly vpc: ec2.IVpc;
}

export class VpcEndpoints extends Construct {
  constructor(scope: Construct, id: string, props: VpcEndpointsProps) {
    super(scope, id);

    const { vpc } = props;
    const isolatedSubnets = { subnetGroupName: 'Isolated' };

    vpc.addGatewayEndpoint('S3Endpoint', {
      service: ec2.GatewayVpcEndpointAwsService.S3,
      subnets: [isolatedSubnets],
    });

    const endpointSecurityGroup = new ec2.SecurityGroup(
      this,
      'EndpointSecurityGroup',
      {
        description: 'Allow HTTPS from within the VPC to interface endpoints',
        vpc,
      }
    );
    endpointSecurityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(443)
    );

    vpc.addInterfaceEndpoint('KmsEndpoint', {
      securityGroups: [endpointSecurityGroup],
      service: ec2.InterfaceVpcEndpointAwsService.KMS,
      subnets: isolatedSubnets,
    });

    vpc.addInterfaceEndpoint('CloudWatchLogsEndpoint', {
      securityGroups: [endpointSecurityGroup],
      service: ec2.InterfaceVpcEndpointAwsService.CLOUDWATCH_LOGS,
      subnets: isolatedSubnets,
    });

    vpc.addInterfaceEndpoint('SecretsManagerEndpoint', {
      securityGroups: [endpointSecurityGroup],
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      subnets: isolatedSubnets,
    });

    vpc.addInterfaceEndpoint('SsmEndpoint', {
      securityGroups: [endpointSecurityGroup],
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: isolatedSubnets,
    });

    vpc.addInterfaceEndpoint('SsmMessagesEndpoint', {
      securityGroups: [endpointSecurityGroup],
      service: ec2.InterfaceVpcEndpointAwsService.SSM_MESSAGES,
      subnets: isolatedSubnets,
    });

    vpc.addInterfaceEndpoint('Ec2MessagesEndpoint', {
      securityGroups: [endpointSecurityGroup],
      service: ec2.InterfaceVpcEndpointAwsService.EC2_MESSAGES,
      subnets: isolatedSubnets,
    });
  }
}
