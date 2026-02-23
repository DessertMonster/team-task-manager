import type { AuthContext } from './cognitoAuth';

export type TeamRole = 'owner' | 'admin' | 'member';
export type ProtectedAction =
  | 'task:create'
  | 'task:update'
  | 'task:delete'
  | 'task:restore'
  | 'team:invite'
  | 'team:remove-member'
  | 'team:transfer-ownership';

const roleMatrix: Record<TeamRole, ProtectedAction[]> = {
  owner: ['task:create', 'task:update', 'task:delete', 'task:restore', 'team:invite', 'team:remove-member', 'team:transfer-ownership'],
  admin: ['task:create', 'task:update', 'task:delete', 'task:restore', 'team:invite', 'team:remove-member'],
  member: ['task:create', 'task:update']
};

export function assertTeamAccess(context: AuthContext, teamId: string): void {
  if (!context.teamIds.includes(teamId)) {
    throw new Error('Forbidden: user does not belong to team');
  }
}

export function assertAuthorizedAction(role: TeamRole, action: ProtectedAction): void {
  if (!roleMatrix[role].includes(action)) {
    throw new Error(`Forbidden: ${role} is not allowed to perform ${action}`);
  }
}

export function canPerform(role: TeamRole, action: ProtectedAction): boolean {
  return roleMatrix[role].includes(action);
}
