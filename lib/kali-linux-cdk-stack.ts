import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as fs from 'fs';

export class KaliLinuxCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a VPC
    const vpc = new ec2.Vpc(this, 'KaliVpc', {
      cidr: '10.0.0.0/16',
      maxAzs: 3,
      subnetConfiguration: [
        {
          name: 'PublicSubnet',
          subnetType: ec2.SubnetType.PUBLIC,
        },
        {
          name: 'PrivateEngressSubnet',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
        },
        {
          name: 'PrivateIsolatedSubnet',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
        },
      ],
    });

    // Output the VPC ID
    new cdk.CfnOutput(this, 'VPCId', {
      value: vpc.vpcId,
    });

    const securityGroup = new ec2.SecurityGroup(this, 'KaliSecurityGroup', {
      vpc,
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3389), 'Allow RDP');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(5900), 'Custum TCP');

    const userDataScript = fs.readFileSync('lib/init.sh', 'utf-8');

    //linux kali ami: kali-last-snapshot-amd64-2023.3.0-804fcc46-63fc-4eb6-85a1-50e66d6c7215

    const ec2Instance = new ec2.Instance(this, 'KaliInstance', {
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC
      },
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.T2, ec2.InstanceSize.MEDIUM),
      machineImage: ec2.MachineImage.lookup({
        name: 'kali-gui-linux-upgraded-to-22-04-v01-8801e2c5-64b9-4c82-a83f-6a2227976dc9'
      }),
      securityGroup,
      userData: ec2.UserData.custom(userDataScript),
    });

    ec2Instance.instance.addPropertyOverride('KeyName', `kali`);

    new cdk.CfnOutput(this, 'EC2 DNS', {
      value: ec2Instance.instancePublicDnsName,
    });

  }
}
