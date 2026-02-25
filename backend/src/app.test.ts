import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiServer } from './app';

function tokenFor(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${header}.${encodedPayload}.sig`;
}

describe('app request handler', () => {
  const server = createApiServer();
  let baseUrl = '';

  beforeAll(async () => {
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address() as AddressInfo;
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve();
      });
    });
  });

  it('returns health response for GET /v1/health', async () => {
    const response = await fetch(`${baseUrl}/v1/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ status: 'ok' });
  });

  it('returns unauthorized when auth header is missing for protected routes', async () => {
    const response = await fetch(`${baseUrl}/v1/teams/team_abc123/tasks`);
    expect(response.status).toBe(401);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.code).toBe('AUTH_UNAUTHORIZED');
    expect(typeof body.correlationId).toBe('string');
  });

  it('returns validation error for bad team id', async () => {
    const token = tokenFor({ sub: 'usr_1', team_ids: ['team_abc123'], scope: 'tasks:read' });

    const response = await fetch(`${baseUrl}/v1/teams/not_team_prefix/tasks`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(response.status).toBe(422);
    const body = (await response.json()) as Record<string, unknown>;
    expect(body.code).toBe('VALIDATION_ERROR');
  });

  it('returns not found for unknown versioned route with valid auth', async () => {
    const token = tokenFor({ sub: 'usr_1', team_ids: ['team_abc123'], scope: 'tasks:read' });

    const response = await fetch(`${baseUrl}/v1/unknown`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    expect(response.status).toBe(404);

    const body = (await response.json()) as Record<string, unknown>;
    expect(body.code).toBe('NOT_FOUND');
    expect(typeof body.correlationId).toBe('string');
  });
});
