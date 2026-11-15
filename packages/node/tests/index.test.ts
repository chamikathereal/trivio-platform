import { describe, it, expect } from 'vitest';
import {
  TrivioClient,
  DEFAULT_BASE_URL,
  DEFAULT_TIMEOUT_MS,
  TrivioValidationError,
  estimatePercentageFee,
} from '../src/index.js';

describe('TrivioClient (@trivio.ink/node foundation)', () => {
  it('initializes with default options in offline mode', () => {
    const client = new TrivioClient();

    expect(client.apiKey).toBeUndefined();
    expect(client.baseUrl).toBe(DEFAULT_BASE_URL);
    expect(client.timeoutMs).toBe(DEFAULT_TIMEOUT_MS);
    expect(client.isCloudConfigured).toBe(false);
    expect(client.version).toBe('0.1.0');
  });

  it('initializes with custom options', () => {
    const client = new TrivioClient({
      apiKey: 'test-key-12345',
      baseUrl: 'https://sandbox.api.trivio.ink',
      timeoutMs: 15_000,
    });

    expect(client.apiKey).toBe('test-key-12345');
    expect(client.baseUrl).toBe('https://sandbox.api.trivio.ink');
    expect(client.timeoutMs).toBe(15_000);
    expect(client.isCloudConfigured).toBe(true);
  });

  it('rejects invalid timeout values', () => {
    expect(() => new TrivioClient({ timeoutMs: -100 })).toThrow(TrivioValidationError);
    expect(() => new TrivioClient({ timeoutMs: 0 })).toThrow(TrivioValidationError);
    // @ts-expect-error testing runtime validation
    expect(() => new TrivioClient({ timeoutMs: '5000' })).toThrow(TrivioValidationError);
  });

  it('rejects invalid baseUrl values', () => {
    expect(() => new TrivioClient({ baseUrl: '   ' })).toThrow(TrivioValidationError);
    // @ts-expect-error testing runtime validation
    expect(() => new TrivioClient({ baseUrl: 12345 })).toThrow(TrivioValidationError);
  });

  it('rejects invalid apiKey values', () => {
    // @ts-expect-error testing runtime validation
    expect(() => new TrivioClient({ apiKey: 12345 })).toThrow(TrivioValidationError);
  });

  it('performs deterministic offline fee calculations using @trivio.ink/core', () => {
    const client = new TrivioClient();
    const result = client.calculateFee(1_000_000, 250);

    expect(result).toEqual({
      grossMinor: 1_000_000,
      feeMinor: 25_000,
      netMinor: 975_000,
      rateBasisPoints: 250,
    });
  });

  it('re-exports core estimation function directly', () => {
    expect(typeof estimatePercentageFee).toBe('function');
    const result = estimatePercentageFee(500_000, 200);
    expect(result.feeMinor).toBe(10_000);
  });
});
