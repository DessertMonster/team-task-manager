import { Stack, type StackProps, CfnOutput } from 'aws-cdk-lib';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import type { Construct } from 'constructs';

export class AuthStack extends Stack {
  public readonly userPool: UserPool;
  public readonly userPoolClient: UserPoolClient;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.userPool = new UserPool(this, 'UserPool', {
      selfSignUpEnabled: true,
      signInAliases: { email: true }
    });

    this.userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      authFlows: {
        userPassword: true,
        userSrp: true
      }
    });

    new CfnOutput(this, 'UserPoolId', { value: this.userPool.userPoolId });
    new CfnOutput(this, 'UserPoolClientId', { value: this.userPoolClient.userPoolClientId });
  }
}
