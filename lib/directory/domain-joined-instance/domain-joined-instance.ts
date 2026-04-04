import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { DirectorySecurityGroup } from '../security-group/directory-security-group.js';

interface DomainJoinedInstanceProps {
  readonly subnets: ReadonlyArray<ec2.ISubnet>;
  readonly vpc: ec2.IVpc;
}

export class DomainJoinedInstance extends Construct {
  constructor(scope: Construct, id: string, props: DomainJoinedInstanceProps) {
    super(scope, id);

    const { subnets, vpc } = props;

    const directoryId = ssm.StringParameter.valueForStringParameter(
      this,
      '/delivery-patterns/directory-id'
    );

    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSSMDirectoryServiceAccess'
        ),
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'AmazonSSMManagedInstanceCore'
        ),
      ],
    });

    NagSuppressions.addResourceSuppressions(role, [
      {
        id: 'AwsSolutions-IAM4',
        reason:
          'AWS managed policies are appropriate for SSM Session Manager access and AD domain join on this proof-of-concept instance.',
      },
    ]);

    const securityGroup = new ec2.SecurityGroup(this, 'SecurityGroup', {
      allowAllOutbound: false,
      description:
        'Allows HTTPS egress to VPC endpoints for SSM Session Manager',
      vpc,
    });
    securityGroup.addEgressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(443),
      'HTTPS to VPC CIDR for SSM endpoints'
    );

    const { securityGroup: adSecurityGroup } = new DirectorySecurityGroup(
      this,
      'AdSecurityGroup',
      { vpc }
    );

    const instance = new ec2.Instance(this, 'Resource', {
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          volume: ec2.BlockDeviceVolume.ebs(30, { encrypted: true }),
        },
      ],
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MEDIUM
      ),
      machineImage: ec2.MachineImage.latestWindows(
        ec2.WindowsVersion.WINDOWS_SERVER_2022_ENGLISH_FULL_BASE
      ),
      role,
      securityGroup,
      vpc,
      vpcSubnets: { subnets: [...subnets] },
    });
    instance.addSecurityGroup(adSecurityGroup);

    NagSuppressions.addResourceSuppressions(instance, [
      {
        id: 'AwsSolutions-EC28',
        reason:
          'Detailed monitoring is disabled to reduce cost for this proof-of-concept instance.',
      },
      {
        id: 'AwsSolutions-EC29',
        reason:
          'Termination protection is not required for this proof-of-concept instance.',
      },
    ]);

    new ssm.CfnAssociation(this, 'DomainJoinAssociation', {
      name: 'AWS-JoinDirectoryServiceDomain',
      parameters: {
        directoryId: [directoryId],
        directoryName: ['corp.awscdkdelivery.internal'],
      },
      targets: [
        {
          key: 'InstanceIds',
          values: [instance.instanceId],
        },
      ],
    });
  }
}
