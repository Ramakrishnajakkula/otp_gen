export type OtpValidationResult =
  | { status: 'success' }
  | { status: 'expired' }
  | { status: 'missing' }
  | { status: 'invalid'; attemptsLeft: number }
  | { status: 'attempts_exceeded' };

export type SessionState = {
  email: string;
  startedAt: number;
};

export type SessionHistoryEntry = {
  email: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
};
