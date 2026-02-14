import type { OtpValidationResult } from '../types/auth';

export type OtpRecord = {
  code: string;
  expiresAt: number;
  attemptsLeft: number;
};

class OtpManager {
  private otpStore = new Map<string, OtpRecord>();

  private readonly OTP_LENGTH = 6;

  private readonly OTP_TTL_MS = 60_000;

  private readonly MAX_ATTEMPTS = 3;

  generateOtp(email: string): OtpRecord {
    const trimmedEmail = email.trim().toLowerCase();
    const code = this.createOtpCode();
    const record: OtpRecord = {
      code,
      expiresAt: Date.now() + this.OTP_TTL_MS,
      attemptsLeft: this.MAX_ATTEMPTS,
    };
    this.otpStore.set(trimmedEmail, record);
    return record;
  }

  validateOtp(email: string, otpInput: string): OtpValidationResult {
    const key = email.trim().toLowerCase();
    const record = this.otpStore.get(key);

    if (!record) {
      return { status: 'missing' };
    }

    if (Date.now() > record.expiresAt) {
      this.otpStore.delete(key);
      return { status: 'expired' };
    }

    if (record.attemptsLeft <= 0) {
      this.otpStore.delete(key);
      return { status: 'attempts_exceeded' };
    }

    if (otpInput === record.code) {
      this.otpStore.delete(key);
      return { status: 'success' };
    }

    const attemptsLeft = record.attemptsLeft - 1;
    if (attemptsLeft <= 0) {
      this.otpStore.delete(key);
      return { status: 'attempts_exceeded' };
    }

    this.otpStore.set(key, { ...record, attemptsLeft });
    return { status: 'invalid', attemptsLeft };
  }

  getRemainingMs(email: string): number {
    const record = this.otpStore.get(email.trim().toLowerCase());
    if (!record) {
      return 0;
    }
    return Math.max(0, record.expiresAt - Date.now());
  }

  getAttemptsLeft(email: string): number {
    const record = this.otpStore.get(email.trim().toLowerCase());
    return record ? record.attemptsLeft : this.MAX_ATTEMPTS;
  }

  private createOtpCode(): string {
    const min = 10 ** (this.OTP_LENGTH - 1);
    const max = 10 ** this.OTP_LENGTH - 1;
    return Math.floor(Math.random() * (max - min + 1) + min).toString();
  }
}

export const otpManager = new OtpManager();
