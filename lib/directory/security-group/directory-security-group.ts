import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';

interface DirectorySecurityGroupProps {
  readonly vpc: ec2.IVpc;
}

export class DirectorySecurityGroup extends Construct {
  readonly securityGroup: ec2.ISecurityGroup;

  constructor(
    scope: Construct,
    id: string,
    props: DirectorySecurityGroupProps
  ) {
    super(scope, id);

    const { vpc } = props;
    const vpcCidr = ec2.Peer.ipv4(vpc.vpcCidrBlock);

    const securityGroup = new ec2.SecurityGroup(this, 'Resource', {
      allowAllOutbound: false,
      description: 'Allows AD protocol traffic for domain-joined resources',
      vpc,
    });

    // DNS
    securityGroup.addEgressRule(vpcCidr, ec2.Port.tcp(53), 'DNS (TCP)');
    securityGroup.addEgressRule(vpcCidr, ec2.Port.udp(53), 'DNS (UDP)');
    // Kerberos
    securityGroup.addEgressRule(vpcCidr, ec2.Port.tcp(88), 'Kerberos (TCP)');
    securityGroup.addEgressRule(vpcCidr, ec2.Port.udp(88), 'Kerberos (UDP)');
    // RPC endpoint mapper
    securityGroup.addEgressRule(
      vpcCidr,
      ec2.Port.tcp(135),
      'RPC endpoint mapper'
    );
    // LDAP
    securityGroup.addEgressRule(vpcCidr, ec2.Port.tcp(389), 'LDAP (TCP)');
    securityGroup.addEgressRule(vpcCidr, ec2.Port.udp(389), 'LDAP (UDP)');
    // SMB
    securityGroup.addEgressRule(vpcCidr, ec2.Port.tcp(445), 'SMB');
    // Kerberos password change
    securityGroup.addEgressRule(
      vpcCidr,
      ec2.Port.tcp(464),
      'Kerberos password change (TCP)'
    );
    securityGroup.addEgressRule(
      vpcCidr,
      ec2.Port.udp(464),
      'Kerberos password change (UDP)'
    );
    // LDAPS
    securityGroup.addEgressRule(vpcCidr, ec2.Port.tcp(636), 'LDAPS');
    // Global Catalog
    securityGroup.addEgressRule(
      vpcCidr,
      ec2.Port.tcp(3268),
      'Global Catalog LDAP'
    );
    securityGroup.addEgressRule(
      vpcCidr,
      ec2.Port.tcp(3269),
      'Global Catalog LDAPS'
    );
    // RPC dynamic ports
    securityGroup.addEgressRule(
      vpcCidr,
      ec2.Port.tcpRange(49152, 65535),
      'RPC dynamic ports'
    );

    this.securityGroup = securityGroup;
  }
}
