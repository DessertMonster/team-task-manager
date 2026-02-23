import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';
import type { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

type AppStackProps = StackProps & {
  environmentName: string;
  userPool: UserPool;
  userPoolClient: UserPoolClient;
  databaseUrl: string;
};

export class AppStack extends Stack {
  constructor(scope: Construct, id: string, props: AppStackProps) {
    super(scope, id, props);

    const apiBaseUrl = `https://api.${props.environmentName}.team-task-manager.example.com`;
    const frontendUrl = `https://app.${props.environmentName}.team-task-manager.example.com`;

    new CfnOutput(this, 'ApiBaseUrl', {
      value: apiBaseUrl,
      exportName: `${this.stackName}:apiBaseUrl`
    });

    new CfnOutput(this, 'FrontendUrl', {
      value: frontendUrl,
      exportName: `${this.stackName}:frontendUrl`
    });

    new CfnOutput(this, 'AuthDependencySummary', {
      value: `${props.userPool.userPoolId}:${props.userPoolClient.userPoolClientId}`
    });

    new CfnOutput(this, 'DatabaseDependencySummary', {
      value: props.databaseUrl
    });
  }
}
