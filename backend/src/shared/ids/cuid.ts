import { randomBytes } from 'node:crypto';

const PREFIXES = {
  user: 'usr_',
  team: 'team_',
  invitation: 'inv_',
  task: 'task_',
  audit: 'audit_'
} as const;

type PrefixValue = (typeof PREFIXES)[keyof typeof PREFIXES];

const CUID_BODY_REGEX = /^[a-z0-9]+$/;

export function createPrefixedId(prefix: PrefixValue): string {
  return `${prefix}${createCuidBody()}`;
}

export function createCuidBody(): string {
  // Produces lowercase alphanumeric body with enough entropy for MVP scope.
  return randomBytes(16).toString('hex');
}

export function isValidPrefixedId(id: string, prefix: PrefixValue): boolean {
  if (!id.startsWith(prefix)) {
    return false;
  }

  const body = id.slice(prefix.length);
  return body.length > 0 && CUID_BODY_REGEX.test(body);
}

export function assertValidPrefixedId(id: string, prefix: PrefixValue): string {
  if (!isValidPrefixedId(id, prefix)) {
    throw new Error(`Invalid identifier format for prefix ${prefix}`);
  }

  return id;
}

export { PREFIXES };
export type { PrefixValue };
