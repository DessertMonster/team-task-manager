import { describe, expect, it } from 'vitest';
import { assertAuthorizedAction, assertTeamAccess, canPerform, type TeamRole } from './authorization';

describe('authorization', () => {
  it('allows team access for member of the team', () => {
    expect(() => assertTeamAccess({ userId: 'usr_1', teamIds: ['team_1'], scopes: [], rawToken: 't' }, 'team_1')).not.toThrow();
  });

  it('rejects team access when user is not in team', () => {
    expect(() => assertTeamAccess({ userId: 'usr_1', teamIds: ['team_2'], scopes: [], rawToken: 't' }, 'team_1')).toThrow(
      'Forbidden: user does not belong to team'
    );
  });

  it('canPerform matches role matrix', () => {
    expect(canPerform('owner', 'team:transfer-ownership')).toBe(true);
    expect(canPerform('admin', 'team:transfer-ownership')).toBe(false);
    expect(canPerform('member', 'task:update')).toBe(true);
    expect(canPerform('member', 'task:delete')).toBe(false);
  });

  it('assertAuthorizedAction throws for disallowed action', () => {
    expect(() => assertAuthorizedAction('admin', 'team:transfer-ownership')).toThrow(
      'Forbidden: admin is not allowed to perform team:transfer-ownership'
    );
  });

  it('assertAuthorizedAction passes for allowed action', () => {
    const roles: TeamRole[] = ['owner', 'admin', 'member'];
    for (const role of roles) {
      const action = role === 'member' ? 'task:update' : 'team:invite';
      expect(() => assertAuthorizedAction(role, action)).not.toThrow();
    }
  });
});
