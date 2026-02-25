import { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createApiServer } from '../../../src/app';

function createBearerToken(teamId: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url');
  const payload = Buffer.from(
    JSON.stringify({
      sub: 'usr_contract_tester',
      team_ids: [teamId],
      scope: 'tasks:read tasks:write'
    })
  ).toString('base64url');

  return `${header}.${payload}.signature`;
}

describe('Tasks contract: GET/POST /v1/teams/{teamId}/tasks', () => {
  const teamId = 'team_contract123';
  const token = createBearerToken(teamId);

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

  it('returns 200 and TaskListResponse shape for list endpoint', async () => {
    const response = await fetch(
      `${baseUrl}/v1/teams/${teamId}/tasks?status=open&page=1&pageSize=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    expect(response.status).toBe(200);

    const body = (await response.json()) as Record<string, unknown>;
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.page).toBe('number');
    expect(typeof body.pageSize).toBe('number');
    expect(typeof body.total).toBe('number');
  });

  it('returns 201 and Task shape for create endpoint', async () => {
    const response = await fetch(`${baseUrl}/v1/teams/${teamId}/tasks`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Contract test task',
        description: 'Created via contract test',
        assignedToUserId: 'usr_member123',
        dueDate: '2026-03-01T12:00:00Z'
      })
    });

    expect(response.status).toBe(201);

    const body = (await response.json()) as Record<string, unknown>;
    expect(typeof body.id).toBe('string');
    expect(body.teamId).toBe(teamId);
    expect(body.title).toBe('Contract test task');
    expect(['open', 'in_progress', 'completed']).toContain(body.status);
    expect(typeof body.createdByUserId).toBe('string');
    expect(typeof body.version).toBe('number');
    expect(typeof body.createdAt).toBe('string');
    expect(typeof body.updatedAt).toBe('string');
  });
});
