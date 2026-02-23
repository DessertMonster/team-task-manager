import { PREFIXES, createPrefixedId } from '../ids/cuid';

export type AuditEventType =
  | 'auth_attempt'
  | 'auth_success'
  | 'auth_failure'
  | 'authz_denied'
  | 'task_created'
  | 'task_updated'
  | 'task_completed'
  | 'task_deleted'
  | 'task_restored'
  | 'invite_created'
  | 'invite_delivery_failed'
  | 'invite_delivery_sent'
  | 'membership_removed'
  | 'ownership_transferred'
  | 'config_changed';

export type AuditEvent = {
  id: string;
  eventType: AuditEventType;
  actorUserId?: string;
  teamId?: string;
  targetType: 'user' | 'team' | 'invitation' | 'task' | 'config';
  targetId: string;
  metadata?: Record<string, unknown>;
  occurredAt: string;
  retentionUntil: string;
};

const ONE_YEAR_DAYS = 365;

export function buildAuditEvent(input: Omit<AuditEvent, 'id' | 'occurredAt' | 'retentionUntil'>): AuditEvent {
  const occurredAt = new Date();
  const retentionUntil = new Date(occurredAt);
  retentionUntil.setUTCDate(retentionUntil.getUTCDate() + ONE_YEAR_DAYS);

  return {
    ...input,
    id: createPrefixedId(PREFIXES.audit),
    occurredAt: occurredAt.toISOString(),
    retentionUntil: retentionUntil.toISOString()
  };
}

export interface AuditSink {
  write(event: AuditEvent): Promise<void>;
}

export class ConsoleAuditSink implements AuditSink {
  async write(event: AuditEvent): Promise<void> {
    // Structured output keeps this easy to swap with persistent storage later.
    process.stdout.write(`${JSON.stringify({ audit: event })}\n`);
  }
}

export async function logAuditEvent(
  sink: AuditSink,
  input: Omit<AuditEvent, 'id' | 'occurredAt' | 'retentionUntil'>
): Promise<AuditEvent> {
  const event = buildAuditEvent(input);
  await sink.write(event);
  return event;
}
