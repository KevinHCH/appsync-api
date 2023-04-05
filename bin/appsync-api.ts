#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AppsyncApiStack } from '../lib/appsync-api-stack';
import { loadEnvironmentConfiguration } from '../utils/load-env-configuration';

const app = new cdk.App();
const envName = app.node.tryGetContext('env')?.toLowerCase();
if (!envName) {
  throw new Error('Must specify environment name in context, use -c env=<ENV_NAME>');
}
const envConfig = loadEnvironmentConfiguration(envName);

new AppsyncApiStack(app, `AppsyncApiStack-${envName}`, {
  stackName: `AppsyncApiStack-${envName}`,
  env: {
    account: envConfig.awsAccount,
    region: envConfig.awsRegion
  },
  envName: envName,
  ...envConfig
});