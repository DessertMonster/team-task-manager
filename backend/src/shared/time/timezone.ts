export function assertIanaTimezone(timezone: string): string {
  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
    return timezone;
  } catch {
    throw new Error(`Invalid IANA timezone: ${timezone}`);
  }
}

export function toUtcIsoString(value: Date | string): string {
  const parsed = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(parsed.getTime())) {
    throw new Error('Invalid date input');
  }
  return parsed.toISOString();
}

export function formatUtcForTimezone(utcIso: string, timezone: string): string {
  assertIanaTimezone(timezone);
  const date = new Date(utcIso);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid UTC timestamp');
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: timezone
  }).format(date);
}
