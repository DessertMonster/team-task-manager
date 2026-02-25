export class StaleVersionError extends Error {
  constructor(public readonly expectedVersion: number, public readonly currentVersion: number) {
    super(`Version conflict: expected ${expectedVersion}, found ${currentVersion}`);
    this.name = 'StaleVersionError';
  }
}

export function assertVersionMatch(expectedVersion: number, currentVersion: number): void {
  if (expectedVersion !== currentVersion) {
    throw new StaleVersionError(expectedVersion, currentVersion);
  }
}

export function nextVersion(currentVersion: number): number {
  return currentVersion + 1;
}
