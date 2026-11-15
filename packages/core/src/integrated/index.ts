// Copyright 2026 trivio.ink
// SPDX-License-Identifier: Apache-2.0

/**
 * @file packages/core/src/integrated/index.ts
 * @description Public exports for Stage 2C integrated fee and settlement forecasting engine.
 */

export {
  calculatePaymentSettlementEstimate,
  DEFAULT_INTEGRATED_CALCULATION_VERSION,
} from './calculate.js';

export type {
  IntegratedTransactionInput,
  IntegratedSettlementConfig,
  IntegratedSettlementOptions,
  IntegratedSettlementEstimateResult,
} from './types.js';
