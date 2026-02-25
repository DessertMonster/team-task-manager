#!/usr/bin/env node
import { App } from 'aws-cdk-lib';
import { AuthStack } from '../lib/auth-stack';
import { DataStack } from '../lib/data-stack';
import { AppStack } from '../lib/app-stack';
import { loadAppConfig } from '../lib/config';

const app = new App();
const config = loadAppConfig();

const authStack = new AuthStack(app, `TeamTaskAuthStack-${config.environmentName}`);
const dataStack = new DataStack(app, `TeamTaskDataStack-${config.environmentName}`, {
  environmentName: config.environmentName
});

new AppStack(app, `TeamTaskAppStack-${config.environmentName}`, {
  environmentName: config.environmentName,
  userPool: authStack.userPool,
  userPoolClient: authStack.userPoolClient,
  databaseUrl: dataStack.databaseUrl
});
