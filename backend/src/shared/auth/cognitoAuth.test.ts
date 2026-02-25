import { describe, expect, it } from 'vitest';
import { buildAuthContext, getBearerToken } from './cognitoAuth';

function tokenFromPayload(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${encodedPayload}.sig`;
}

describe('cognitoAuth', () => {
  it('extracts bearer token from authorization header', () => {
    const token = getBearerToken({ authorization: 'Bearer abc123' });
    expect(token).toBe('abc123');
  });

  it('throws for missing or invalid authorization header', () => {
    expect(() => getBearerToken({})).toThrow('Missing or invalid Authorization header');
    expect(() => getBearerToken({ authorization: 'Basic abc123' })).toThrow('Missing or invalid Authorization header');
  });

  it('builds auth context with subject, teams, and scopes', () => {
    const token = tokenFromPayload({
      sub: 'usr_auth1',
      team_ids: ['team_a', 'team_b', 123],
      scope: 'tasks:read tasks:write'
    });

    const context = buildAuthContext({ authorization: `Bearer ${token}` });

    expect(context.userId).toBe('usr_auth1');
    expect(context.teamIds).toEqual(['team_a', 'team_b']);
    expect(context.scopes).toEqual(['tasks:read', 'tasks:write']);
    expect(context.rawToken).toBe(token);
  });

  it('defaults teams and scopes when claims are missing', () => {
    const token = tokenFromPayload({ sub: 'usr_auth2' });
    const context = buildAuthContext({ authorization: `Bearer ${token}` });

    expect(context.teamIds).toEqual([]);
    expect(context.scopes).toEqual([]);
  });

  it('throws for malformed token payload', () => {
    expect(() => buildAuthContext({ authorization: 'Bearer not-a-jwt' })).toThrow('Malformed JWT token');
  });

  it('throws when subject claim is missing', () => {
    const token = tokenFromPayload({ scope: 'tasks:read' });
    expect(() => buildAuthContext({ authorization: `Bearer ${token}` })).toThrow('JWT is missing subject claim');
  });
});
