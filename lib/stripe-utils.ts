// Client-safe Stripe utility functions
// These functions don't access any secret keys and can be used on both client and server

export function formatAmountForDisplay(amount: number, currency: string): string {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  return numberFormat.format(amount / 100);
}

export function formatAmountForStripe(amount: number, currency: string): number {
  const numberFormat = new Intl.NumberFormat(['en-US'], {
    style: 'currency',
    currency: currency,
    currencyDisplay: 'symbol',
  });
  const parts = numberFormat.formatToParts(amount);
  let zeroDecimalCurrency = false;
  
  // Zero decimal currencies like JPY don't need to be multiplied by 100
  const zeroDecimalCurrencies = ['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF'];
  
  if (zeroDecimalCurrencies.includes(currency.toUpperCase())) {
    zeroDecimalCurrency = true;
  }
  
  return zeroDecimalCurrency ? amount : Math.round(amount * 100);
}