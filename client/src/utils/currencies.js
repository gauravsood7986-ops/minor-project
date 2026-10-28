export const CURRENCIES = [
  { code: 'INR', symbol: '₹', label: 'INR (₹ - Indian Rupee)' },
  { code: 'USD', symbol: '$', label: 'USD ($ - US Dollar)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€ - Euro)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£ - British Pound)' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$ - Canadian Dollar)' },
  { code: 'AUD', symbol: 'AU$', label: 'AUD (AU$ - Australian Dollar)' },
];

export const getCurrencySymbol = (code = 'INR') => {
  const match = CURRENCIES.find((c) => c.code === (code || 'INR').toUpperCase());
  return match ? match.symbol : (code || '₹');
};
