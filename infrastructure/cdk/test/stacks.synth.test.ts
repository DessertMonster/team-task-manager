import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { strict as assert } from 'node:assert';
import { AuthStack } from '../lib/auth-stack';
import { DataStack } from '../lib/data-stack';
import { AppStack } from '../lib/app-stack';

export function runSynthAssertions(): void {
  const app = new App();
  const authStack = new AuthStack(app, 'AuthStackTest');
  const dataStack = new DataStack(app, 'DataStackTest', { environmentName: 'test' });
  const appStack = new AppStack(app, 'AppStackTest', {
    environmentName: 'test',
    userPool: authStack.userPool,
    userPoolClient: authStack.userPoolClient,
    databaseUrl: dataStack.databaseUrl
  });

  const authTemplate = Template.fromStack(authStack);
  const appTemplate = Template.fromStack(appStack);

  authTemplate.resourceCountIs('AWS::Cognito::UserPool', 1);
  appTemplate.hasOutput('ApiBaseUrl', {});
  appTemplate.hasOutput('FrontendUrl', {});
}

if (require.main === module) {
  runSynthAssertions();
  assert.ok(true);
}
