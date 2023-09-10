#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { KaliLinuxCdkStack } from '../lib/kali-linux-cdk-stack';

const app = new cdk.App();
new KaliLinuxCdkStack(app, 'KaliLinuxCdkStack', {
  env : {
    region: 'ap-south-1',
  }
});