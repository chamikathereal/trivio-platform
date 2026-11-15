/**
 * @file packages/react/src/context.ts
 * @description React Context and Provider establishing shared defaults for Trivio settlement components.
 */

import React, { createContext, useContext, useMemo } from 'react';
import type { TrivioContextValue, TrivioProviderProps } from './types.js';

const defaultContextValue: TrivioContextValue = {
  currencyCode: 'USD',
  theme: 'dark',
  locale: 'en-US',
};

const TrivioContext = createContext<TrivioContextValue>(defaultContextValue);

/**
 * Context provider establishing configuration defaults for Trivio settlement components.
 * Configures default display currency, theme, and locale across child component trees.
 * Never stores or assumes financial fee rates.
 *
 * @example
 * <TrivioProvider currencyCode="LKR" theme="dark">
 *   <TrivioSettlementSummary estimate={estimate} />
 * </TrivioProvider>
 */
export function TrivioProvider({
  currencyCode = 'USD',
  theme = 'dark',
  locale = 'en-US',
  children,
}: TrivioProviderProps): React.JSX.Element {
  const value = useMemo<TrivioContextValue>(
    () => ({
      currencyCode,
      theme,
      locale,
    }),
    [currencyCode, theme, locale]
  );

  return React.createElement(TrivioContext.Provider, { value }, children);
}

/**
 * Hook to access active Trivio context configuration.
 * Returns default configuration when called outside of a `TrivioProvider`.
 */
export function useTrivio(): TrivioContextValue {
  return useContext(TrivioContext);
}
