import type { IncomingHttpHeaders } from 'node:http';

export type AuthContext = {
  userId: string;
  teamIds: string[];
  scopes: string[];
  rawToken: string;
};

const TOKEN_PREFIX = 'Bearer ';

function decodeJwtPayload(token: string): Record<string, unknown> {
  const [, payload] = token.split('.');
  if (!payload) {
    throw new Error('Malformed JWT token');
  }

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const json = Buffer.from(normalized, 'base64').toString('utf8');
  return JSON.parse(json) as Record<string, unknown>;
}

export function getBearerToken(headers: IncomingHttpHeaders): string {
  const authorization = headers.authorization;
  if (!authorization || !authorization.startsWith(TOKEN_PREFIX)) {
    throw new Error('Missing or invalid Authorization header');
  }

  return authorization.slice(TOKEN_PREFIX.length);
}

export function buildAuthContext(headers: IncomingHttpHeaders): AuthContext {
  const token = getBearerToken(headers);
  const payload = decodeJwtPayload(token);

  const sub = payload.sub;
  if (typeof sub !== 'string' || sub.length === 0) {
    throw new Error('JWT is missing subject claim');
  }

  const teamIds = Array.isArray(payload.team_ids)
    ? payload.team_ids.filter((value): value is string => typeof value === 'string')
    : [];

  const scopeString = typeof payload.scope === 'string' ? payload.scope : '';
  const scopes = scopeString.length > 0 ? scopeString.split(' ') : [];

  return {
    userId: sub,
    teamIds,
    scopes,
    rawToken: token
  };
}
