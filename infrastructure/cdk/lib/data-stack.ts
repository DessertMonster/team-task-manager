import { CfnOutput, Stack, type StackProps } from 'aws-cdk-lib';
import type { Construct } from 'constructs';

export type DataStackProps = StackProps & {
  environmentName: string;
};

export class DataStack extends Stack {
  public readonly databaseUrl: string;

  constructor(scope: Construct, id: string, props: DataStackProps) {
    super(scope, id, props);

    this.databaseUrl = `postgresql://team-task-${props.environmentName}.example.local:5432/team_task_manager`;

    new CfnOutput(this, 'DatabaseUrl', {
      value: this.databaseUrl,
      description: 'Placeholder DB URL for environment wiring'
    });
  }
}
