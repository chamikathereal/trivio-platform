/**
 * @file packages/core/tests/settlement.test.ts
 * @description Comprehensive automated tests for Stage 2B Dynamic Settlement Calendar Engine.
 */

import { describe, expect, it } from 'vitest';
import {
  addBusinessDays,
  addCalendarDays,
  adjustNonWorkingDay,
  calculateSettlementSpecificityScore,
  daysBetween,
  DEFAULT_SETTLEMENT_CALCULATION_VERSION,
  estimateSettlementDate,
  findEligibleWorkingDay,
  findMatchingSettlementPolicy,
  formatISODate,
  getISOWeekday,
  getNextWorkingDay,
  getZonedDateTimeParts,
  isHoliday,
  isWorkingDay,
  parseISODate,
  parseIsoTimestamp,
  SettlementCalendarNotFoundError,
  SettlementPolicyConflictError,
  SettlementPolicyNotFoundError,
  SettlementRangeError,
  SettlementValidationError,
  validateAndNormalizeSettlementCalendar,
  validateAndNormalizeSettlementCalendars,
  validateAndNormalizeSettlementPolicies,
  validateAndNormalizeSettlementPolicy,
  validateAndNormalizeSettlementTransaction,
  validateIanaTimeZone,
  type SettlementCalendar,
  type SettlementPolicy,
  type SettlementTransactionInput,
} from '../src/index.js';

describe('Stage 2B: Settlement Calendar Engine', () => {
  // Standard test calendar: Monday - Friday (1..5) in Asia/Colombo with no holidays
  const standardCalendar: SettlementCalendar = {
    id: 'test-standard-calendar',
    version: '1.0.0',
    timeZone: 'Asia/Colombo',
    workingDays: [1, 2, 3, 4, 5],
    holidays: [],
  };

  // Standard T+1 business days policy with 17:00 cut-off
  const standardPolicyT1: SettlementPolicy = {
    id: 'pol-boc-standard-t1',
    version: '1.0.0',
    acquirerId: 'ACQ_BOC',
    effectiveFrom: '2026-01-01',
    priority: 0,
    cycleLength: 1,
    cycleUnit: 'business_days',
    cutOffTime: '17:00',
    timeZone: 'Asia/Colombo',
    calendarId: 'test-standard-calendar',
    nonWorkingDayConvention: 'following_business_day',
  };

  // -------------------------------------------------------------------------
  // 1. Prompt Reference Test Cases (Section 5, Examples A through H)
  // -------------------------------------------------------------------------
  describe('Prompt Reference Examples (Section 5)', () => {
    it('Example A: T+1 before cut-off (Friday 10:00 -> settles Monday)', () => {
      const tx: SettlementTransactionInput = {
        id: 'tx-ex-a',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [standardPolicyT1],
        [standardCalendar]
      );

      expect(result.localTransactionDate).toBe('2026-11-13');
      expect(result.localTransactionTime).toBe('10:00:00');
      expect(result.isPastCutOff).toBe(false);
      expect(result.anchorProcessingDate).toBe('2026-11-13');
      expect(result.expectedSettlementDate).toBe('2026-11-16'); // Monday
      expect(result.daysDeferred).toBe(3);
      expect(result.settlementCycle).toBe('T+1');
      expect(result.isEstimated).toBe(true);
      expect(result.status).toBe('ESTIMATED');
    });

    it('Example B: T+1 after cut-off (Friday 18:00 -> settles Tuesday)', () => {
      const tx: SettlementTransactionInput = {
        id: 'tx-ex-b',
        transactionTime: '2026-11-13T18:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [standardPolicyT1],
        [standardCalendar]
      );

      expect(result.localTransactionDate).toBe('2026-11-13');
      expect(result.localTransactionTime).toBe('18:00:00');
      expect(result.isPastCutOff).toBe(true);
      expect(result.anchorProcessingDate).toBe('2026-11-16'); // Monday
      expect(result.expectedSettlementDate).toBe('2026-11-17'); // Tuesday
      expect(result.daysDeferred).toBe(4);
    });

    it('Example C: T+2 before cut-off (Friday 10:00 -> settles Tuesday)', () => {
      const policyT2: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-boc-standard-t2',
        cycleLength: 2,
      };

      const tx: SettlementTransactionInput = {
        id: 'tx-ex-c',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(tx, [policyT2], [standardCalendar]);

      expect(result.anchorProcessingDate).toBe('2026-11-13'); // Friday
      expect(result.expectedSettlementDate).toBe('2026-11-17'); // Tuesday
      expect(result.daysDeferred).toBe(4);
      expect(result.settlementCycle).toBe('T+2');
    });

    it('Example D: T+1 with configured holiday (Monday 16 Nov is holiday -> settles Tuesday)', () => {
      const holidayCalendar: SettlementCalendar = {
        ...standardCalendar,
        id: 'test-holiday-calendar',
        holidays: ['2026-11-16'], // Monday is non-working
        holidayLabels: { '2026-11-16': 'Test Fictional Holiday' },
      };

      const policy: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-holiday-t1',
        calendarId: 'test-holiday-calendar',
      };

      const tx: SettlementTransactionInput = {
        id: 'tx-ex-d',
        transactionTime: '2026-11-13T10:00:00+05:30', // Friday before cut-off
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(tx, [policy], [holidayCalendar]);

      expect(result.anchorProcessingDate).toBe('2026-11-13');
      expect(result.expectedSettlementDate).toBe('2026-11-17'); // Skips Sat, Sun, Mon (holiday) -> Tuesday
      expect(result.daysDeferred).toBe(4);
    });

    it('Example E: T+0 after cut-off (Friday after cut-off -> anchors and settles Monday)', () => {
      const policyT0: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-boc-standard-t0',
        cycleLength: 0,
      };

      const tx: SettlementTransactionInput = {
        id: 'tx-ex-e',
        transactionTime: '2026-11-13T18:00:00+05:30', // Friday after cut-off
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(tx, [policyT0], [standardCalendar]);

      expect(result.isPastCutOff).toBe(true);
      expect(result.anchorProcessingDate).toBe('2026-11-16'); // Monday
      expect(result.expectedSettlementDate).toBe('2026-11-16'); // Monday (T+0 from Monday anchor)
      expect(result.settlementCycle).toBe('T+0');
      expect(result.daysDeferred).toBe(3);
    });

    it('Example F: Weekend transaction (Saturday 14 Nov -> anchors Monday, settles Tuesday)', () => {
      const tx: SettlementTransactionInput = {
        id: 'tx-ex-f',
        transactionTime: '2026-11-14T11:30:00+05:30', // Saturday
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [standardPolicyT1],
        [standardCalendar]
      );

      expect(result.localTransactionDate).toBe('2026-11-14');
      expect(result.localWeekday).toBe(6); // Saturday
      expect(result.isLocalTransactionWorkingDay).toBe(false);
      expect(result.anchorProcessingDate).toBe('2026-11-16'); // Monday
      expect(result.expectedSettlementDate).toBe('2026-11-17'); // Tuesday
      expect(result.daysDeferred).toBe(3);
    });

    it('Example G: Cut-off boundary precision (16:59:59 vs 17:00:00 vs 17:00:01)', () => {
      // 1 second before cut-off
      const txBefore: SettlementTransactionInput = {
        transactionTime: '2026-11-13T16:59:59+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };
      const resBefore = estimateSettlementDate(
        txBefore,
        [standardPolicyT1],
        [standardCalendar]
      );
      expect(resBefore.isPastCutOff).toBe(false);
      expect(resBefore.anchorProcessingDate).toBe('2026-11-13');
      expect(resBefore.expectedSettlementDate).toBe('2026-11-16');

      // Exactly at cut-off
      const txAt: SettlementTransactionInput = {
        transactionTime: '2026-11-13T17:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };
      const resAt = estimateSettlementDate(
        txAt,
        [standardPolicyT1],
        [standardCalendar]
      );
      expect(resAt.isPastCutOff).toBe(true);
      expect(resAt.anchorProcessingDate).toBe('2026-11-16');
      expect(resAt.expectedSettlementDate).toBe('2026-11-17');

      // 1 second after cut-off
      const txAfter: SettlementTransactionInput = {
        transactionTime: '2026-11-13T17:00:01+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };
      const resAfter = estimateSettlementDate(
        txAfter,
        [standardPolicyT1],
        [standardCalendar]
      );
      expect(resAfter.isPastCutOff).toBe(true);
      expect(resAfter.anchorProcessingDate).toBe('2026-11-16');
      expect(resAfter.expectedSettlementDate).toBe('2026-11-17');
    });

    it('Example H: Calendar days vs Business days differentiation', () => {
      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30', // Friday morning
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const policyBusinessDays: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-business-days',
        cycleLength: 2,
        cycleUnit: 'business_days',
      };

      const policyCalendarDays: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-calendar-days',
        cycleLength: 2,
        cycleUnit: 'calendar_days',
        nonWorkingDayConvention: 'following_business_day',
      };

      const resBusiness = estimateSettlementDate(
        tx,
        [policyBusinessDays],
        [standardCalendar]
      );
      const resCalendar = estimateSettlementDate(
        tx,
        [policyCalendarDays],
        [standardCalendar]
      );

      // Business days: Friday + 2 business days = Tuesday, 17 Nov
      expect(resBusiness.expectedSettlementDate).toBe('2026-11-17');

      // Calendar days: Friday + 2 calendar days = Sunday, 15 Nov -> rolled to Monday, 16 Nov
      expect(resCalendar.expectedSettlementDate).toBe('2026-11-16');

      expect(resBusiness.expectedSettlementDate).not.toBe(
        resCalendar.expectedSettlementDate
      );
    });
  });

  // -------------------------------------------------------------------------
  // 2. Calendar Primitives & Math
  // -------------------------------------------------------------------------
  describe('Calendar Primitives & Math', () => {
    it('parses valid ISO dates and formats them accurately', () => {
      const parsed = parseISODate('2026-11-15');
      expect(parsed).toEqual({ year: 2026, month: 11, day: 15 });
      expect(formatISODate(2026, 11, 15)).toBe('2026-11-15');
    });

    it('rejects impossible dates (e.g. Feb 29 on non-leap year, invalid month/day)', () => {
      expect(() => parseISODate('2026-02-29')).toThrow(
        SettlementValidationError
      );
      expect(() => parseISODate('2026-04-31')).toThrow(
        SettlementValidationError
      );
      expect(() => parseISODate('2026-13-01')).toThrow(
        SettlementValidationError
      );
      expect(() => parseISODate('invalid-date')).toThrow(
        SettlementValidationError
      );
    });

    it('accepts Feb 29 on leap years', () => {
      const leap = parseISODate('2028-02-29');
      expect(leap).toEqual({ year: 2028, month: 2, day: 29 });
    });

    it('adds calendar days across month, year, and leap-year boundaries', () => {
      expect(addCalendarDays('2026-11-30', 1)).toBe('2026-12-01');
      expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01');
      expect(addCalendarDays('2028-02-28', 1)).toBe('2028-02-29');
      expect(addCalendarDays('2028-02-29', 1)).toBe('2028-03-01');
      expect(addCalendarDays('2026-03-01', -1)).toBe('2026-02-28');
    });

    it('computes daysBetween correctly', () => {
      expect(daysBetween('2026-11-13', '2026-11-16')).toBe(3);
      expect(daysBetween('2026-12-30', '2027-01-02')).toBe(3);
    });

    it('identifies ISO weekdays correctly (1=Mon ... 7=Sun)', () => {
      expect(getISOWeekday('2026-11-09')).toBe(1); // Monday
      expect(getISOWeekday('2026-11-13')).toBe(5); // Friday
      expect(getISOWeekday('2026-11-14')).toBe(6); // Saturday
      expect(getISOWeekday('2026-11-15')).toBe(7); // Sunday
    });

    it('handles consecutive holidays and advances to next active working day', () => {
      const cal: SettlementCalendar = {
        id: 'consecutive-holidays',
        version: '1',
        timeZone: 'Asia/Colombo',
        workingDays: [1, 2, 3, 4, 5],
        holidays: ['2026-11-16', '2026-11-17'], // Mon and Tue are holidays
      };

      // Friday 13 Nov + 1 business day -> should roll across Sat, Sun, Mon (hol), Tue (hol) -> Wed 18 Nov
      const settled = addBusinessDays('2026-11-13', 1, cal);
      expect(settled).toBe('2026-11-18');
    });

    it('supports custom workweeks (e.g. Sunday to Thursday)', () => {
      const middleEastCal: SettlementCalendar = {
        id: 'me-calendar',
        version: '1',
        timeZone: 'Asia/Dubai',
        workingDays: [7, 1, 2, 3, 4], // Sun, Mon, Tue, Wed, Thu (Fri & Sat are weekend)
        holidays: [],
      };

      expect(isWorkingDay('2026-11-12', middleEastCal)).toBe(true); // Thursday
      expect(isWorkingDay('2026-11-13', middleEastCal)).toBe(false); // Friday (weekend)
      expect(isWorkingDay('2026-11-14', middleEastCal)).toBe(false); // Saturday (weekend)
      expect(isWorkingDay('2026-11-15', middleEastCal)).toBe(true); // Sunday (working day)

      // Thursday + 1 business day -> Sunday
      expect(addBusinessDays('2026-11-12', 1, middleEastCal)).toBe('2026-11-15');
    });

    it('tests all nonWorkingDayConvention options', () => {
      const cal: SettlementCalendar = {
        id: 'cal-conventions',
        version: '1',
        timeZone: 'UTC',
        workingDays: [1, 2, 3, 4, 5],
        holidays: ['2026-11-16'], // Monday is holiday
      };

      // Target Sunday 15 Nov (non-working)
      // following: Monday is holiday -> advances to Tuesday 17 Nov
      expect(adjustNonWorkingDay('2026-11-15', cal, 'following_business_day')).toBe(
        '2026-11-17'
      );

      // preceding: rolls backward to Friday 13 Nov
      expect(adjustNonWorkingDay('2026-11-15', cal, 'preceding_business_day')).toBe(
        '2026-11-13'
      );

      // no_adjustment: retains Sunday 15 Nov
      expect(adjustNonWorkingDay('2026-11-15', cal, 'no_adjustment')).toBe(
        '2026-11-15'
      );
    });

    it('protects against infinite loops on invalid calendars (loop guard)', () => {
      const impossibleCal: SettlementCalendar = {
        id: 'all-holidays',
        version: '1',
        timeZone: 'UTC',
        workingDays: [1, 2, 3, 4, 5],
        holidays: [], // will mock or throw if no working days
      };

      // Calendar with zero working days is rejected during validation
      expect(() =>
        validateAndNormalizeSettlementCalendar({
          ...impossibleCal,
          workingDays: [],
        })
      ).toThrow(SettlementValidationError);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Timezone Correctness
  // -------------------------------------------------------------------------
  describe('Timezone Correctness', () => {
    it('validates IANA timezone identifiers strictly', () => {
      expect(() => validateIanaTimeZone('Asia/Colombo')).not.toThrow();
      expect(() => validateIanaTimeZone('UTC')).not.toThrow();
      expect(() => validateIanaTimeZone('America/New_York')).not.toThrow();
      expect(() => validateIanaTimeZone('Invalid/Timezone_Name')).toThrow(
        SettlementRangeError
      );
      expect(() => validateIanaTimeZone('')).toThrow(
        SettlementValidationError
      );
    });

    it('parses ISO 8601 timestamps and rejects bare local strings without offset', () => {
      expect(() => parseIsoTimestamp('2026-11-13T10:00:00Z')).not.toThrow();
      expect(() =>
        parseIsoTimestamp('2026-11-13T10:00:00+05:30')
      ).not.toThrow();
      expect(() =>
        parseIsoTimestamp('2026-11-13T10:00:00-05:00')
      ).not.toThrow();

      // Missing offset
      expect(() => parseIsoTimestamp('2026-11-13T10:00:00')).toThrow(
        SettlementValidationError
      );
      expect(() => parseIsoTimestamp('invalid-timestamp')).toThrow(
        SettlementValidationError
      );
    });

    it('decomposes timestamps into exact local date and time in target timezone', () => {
      // 04:30 UTC is 10:00 in Asia/Colombo (+05:30)
      const parts = getZonedDateTimeParts(
        '2026-11-13T04:30:00Z',
        'Asia/Colombo'
      );
      expect(parts.localDate).toBe('2026-11-13');
      expect(parts.localTime).toBe('10:00:00');
      expect(parts.isoWeekday).toBe(5); // Friday

      // 23:30 UTC on 13 Nov is 05:00 on 14 Nov in Asia/Colombo
      const partsCrossDate = getZonedDateTimeParts(
        '2026-11-13T23:30:00Z',
        'Asia/Colombo'
      );
      expect(partsCrossDate.localDate).toBe('2026-11-14');
      expect(partsCrossDate.localTime).toBe('05:00:00');
      expect(partsCrossDate.isoWeekday).toBe(6); // Saturday
    });

    it('handles midnight boundaries cleanly without returning 24:00', () => {
      const partsMidnight = getZonedDateTimeParts(
        '2026-11-13T00:00:00+05:30',
        'Asia/Colombo'
      );
      expect(partsMidnight.localTime).toBe('00:00:00');
      expect(partsMidnight.localDate).toBe('2026-11-13');
    });

    it('handles US Daylight Saving transitions safely', () => {
      // 2026-11-01 is US DST fallback (EDT UTC-4 to EST UTC-5)
      const parts1 = getZonedDateTimeParts(
        '2026-11-01T05:00:00Z',
        'America/New_York'
      );
      const parts2 = getZonedDateTimeParts(
        '2026-11-01T07:00:00Z',
        'America/New_York'
      );
      expect(parts1.localDate).toBe('2026-11-01');
      expect(parts1.localTime).toBe('01:00:00');
      expect(parts2.localDate).toBe('2026-11-01');
      expect(parts2.localTime).toBe('02:00:00');
    });
  });

  // -------------------------------------------------------------------------
  // 4. Policy Matching & Specificity
  // -------------------------------------------------------------------------
  describe('Settlement Policy Matching & Specificity', () => {
    it('matches terminal-specific policy over merchant and generic policies', () => {
      const genericPolicy: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-generic',
        cycleLength: 3,
      };

      const merchantPolicy: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-merchant',
        merchantId: 'MERCHANT_ABC',
        cycleLength: 2,
      };

      const terminalPolicy: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-terminal',
        merchantId: 'MERCHANT_ABC',
        terminalId: 'TERM_POS_001',
        cycleLength: 1,
      };

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        merchantId: 'MERCHANT_ABC',
        terminalId: 'TERM_POS_001',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [genericPolicy, merchantPolicy, terminalPolicy],
        [standardCalendar]
      );

      expect(result.appliedPolicy.policyId).toBe('pol-terminal');
      expect(result.cycleLength).toBe(1);
    });

    it('respects explicit priority overriding specificity', () => {
      const specificLowPriority: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-specific-low',
        terminalId: 'TERM_POS_001',
        priority: 0,
        cycleLength: 3,
      };

      const genericHighPriority: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-generic-high',
        priority: 10,
        cycleLength: 1,
      };

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        terminalId: 'TERM_POS_001',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [specificLowPriority, genericHighPriority],
        [standardCalendar]
      );

      expect(result.appliedPolicy.policyId).toBe('pol-generic-high');
      expect(result.cycleLength).toBe(1);
    });

    it('filters policies based on effective date windows', () => {
      const expiredPolicy: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-expired',
        effectiveFrom: '2025-01-01',
        effectiveTo: '2025-12-31',
      };

      const futurePolicy: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-future',
        effectiveFrom: '2027-01-01',
      };

      const activePolicy: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-active',
        effectiveFrom: '2026-01-01',
        effectiveTo: '2026-12-31',
      };

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [expiredPolicy, futurePolicy, activePolicy],
        [standardCalendar]
      );

      expect(result.appliedPolicy.policyId).toBe('pol-active');
    });

    it('throws SettlementPolicyNotFoundError when no policy matches acquirer', () => {
      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_UNKNOWN',
        currency: 'LKR',
      };

      expect(() =>
        estimateSettlementDate(tx, [standardPolicyT1], [standardCalendar])
      ).toThrow(SettlementPolicyNotFoundError);
    });

    it('throws SettlementPolicyConflictError when two distinct policies tie in priority and specificity', () => {
      const policyA: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-tie-a',
        cycleLength: 1,
      };

      const policyB: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-tie-b',
        cycleLength: 2, // Conflicting cycle duration!
      };

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      expect(() =>
        estimateSettlementDate(tx, [policyA, policyB], [standardCalendar])
      ).toThrow(SettlementPolicyConflictError);
    });

    it('deduplicates identical policies cleanly without throwing conflict', () => {
      const dup1: SettlementPolicy = { ...standardPolicyT1, id: 'pol-dup' };
      const dup2: SettlementPolicy = { ...standardPolicyT1, id: 'pol-dup' };

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      expect(() =>
        estimateSettlementDate(tx, [dup1, dup2], [standardCalendar])
      ).not.toThrow();
    });

    it('guarantees input-array ordering independence', () => {
      const polGeneric: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-generic',
        cycleLength: 2,
      };
      const polTerminal: SettlementPolicy = {
        ...standardPolicyT1,
        id: 'pol-terminal',
        terminalId: 'POS_777',
        cycleLength: 1,
      };

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        terminalId: 'POS_777',
        currency: 'LKR',
      };

      const res1 = estimateSettlementDate(
        tx,
        [polGeneric, polTerminal],
        [standardCalendar]
      );
      const res2 = estimateSettlementDate(
        tx,
        [polTerminal, polGeneric],
        [standardCalendar]
      );

      expect(res1.appliedPolicy.policyId).toBe(res2.appliedPolicy.policyId);
      expect(res1.expectedSettlementDate).toBe(res2.expectedSettlementDate);
    });

    it('throws SettlementCalendarNotFoundError if policy references missing calendar', () => {
      const brokenPolicy: SettlementPolicy = {
        ...standardPolicyT1,
        calendarId: 'non-existent-cal',
      };

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      expect(() =>
        estimateSettlementDate(tx, [brokenPolicy], [standardCalendar])
      ).toThrow(SettlementCalendarNotFoundError);
    });
  });

  // -------------------------------------------------------------------------
  // 5. Immutability, Serialization & Audit Breakdown
  // -------------------------------------------------------------------------
  describe('Immutability, Serialization & Audit Breakdown', () => {
    it('enforces genuine runtime immutability on returned result and applied policy', () => {
      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [standardPolicyT1],
        [standardCalendar]
      );

      expect(Object.isFrozen(result)).toBe(true);
      expect(Object.isFrozen(result.appliedPolicy)).toBe(true);
      expect(Object.isFrozen(result.appliedPolicy.workingDays)).toBe(true);
      expect(Object.isFrozen(result.appliedPolicy.holidays)).toBe(true);
      expect(Object.isFrozen(result.adjustments)).toBe(true);

      // Attempted mutation throws in strict mode
      expect(() => {
        // @ts-expect-error mutating frozen property
        result.expectedSettlementDate = '2099-01-01';
      }).toThrow();
    });

    it('guarantees that mutating caller-owned configuration after calculation cannot alter result', () => {
      const mutableCalendar: SettlementCalendar = {
        id: 'mutable-cal',
        version: '1',
        timeZone: 'Asia/Colombo',
        workingDays: [1, 2, 3, 4, 5],
        holidays: [],
      };

      const mutablePolicy: SettlementPolicy = {
        ...standardPolicyT1,
        calendarId: 'mutable-cal',
      };

      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [mutablePolicy],
        [mutableCalendar]
      );

      // Mutate caller objects post-calculation
      mutableCalendar.workingDays.push(6);
      mutableCalendar.holidays.push('2026-11-16');
      mutablePolicy.cycleLength = 99;

      // Result remains unchanged
      expect(result.expectedSettlementDate).toBe('2026-11-16');
      expect(result.cycleLength).toBe(1);
      expect(result.appliedPolicy.cycleLength).toBe(1);
      expect(result.appliedPolicy.workingDays).toEqual([1, 2, 3, 4, 5]);
      expect(result.appliedPolicy.holidays).toEqual([]);
    });

    it('safely serializes to JSON and round-trips without loss', () => {
      const tx: SettlementTransactionInput = {
        id: 'tx-json-001',
        transactionTime: '2026-11-13T10:00:00+05:30',
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [standardPolicyT1],
        [standardCalendar]
      );

      const jsonStr = JSON.stringify(result);
      const deserialized = JSON.parse(jsonStr);

      expect(deserialized.transactionId).toBe('tx-json-001');
      expect(deserialized.expectedSettlementDate).toBe('2026-11-16');
      expect(deserialized.isEstimated).toBe(true);
      expect(deserialized.status).toBe('ESTIMATED');
      expect(deserialized.appliedPolicy.policyId).toBe('pol-boc-standard-t1');
      expect(Array.isArray(deserialized.adjustments)).toBe(true);
      expect(deserialized.adjustments.length).toBeGreaterThan(0);
    });

    it('contains clear, informative audit step explanations in adjustments', () => {
      const tx: SettlementTransactionInput = {
        transactionTime: '2026-11-13T18:30:00+05:30', // after cut-off
        acquirerId: 'ACQ_BOC',
        currency: 'LKR',
      };

      const result = estimateSettlementDate(
        tx,
        [standardPolicyT1],
        [standardCalendar]
      );

      expect(result.adjustments.some((msg) => msg.includes('cut-off'))).toBe(
        true
      );
      expect(result.adjustments.some((msg) => msg.includes('T+1'))).toBe(true);
      expect(result.calculationVersion).toBe(
        DEFAULT_SETTLEMENT_CALCULATION_VERSION
      );
    });
  });
});
