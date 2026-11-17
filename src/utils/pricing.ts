import { CartItem, CheckoutFormData } from '../types/store';

export const FREE_SHIPPING_THRESHOLD = 45000;
export const STANDARD_SHIPPING_FEE = 1500;
export const VAT_RATE = 0.18;

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number): string {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
  return `LKR ${formatted}`;
}

export interface CartTotals {
  itemCount: number;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  remainingForFreeShipping: number;
  freeShippingProgressPct: number;
}

export function calculateCartTotals(
  items: CartItem[],
  paymentMethod: CheckoutFormData['paymentMethod'] = 'card'
): CartTotals {
  const itemCount = items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0);
  const subtotal = roundCurrency(
    items.reduce((sum, item) => sum + item.unitPrice * Math.max(0, item.quantity), 0)
  );
  const shipping =
    subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD || paymentMethod === 'pickup'
      ? 0
      : STANDARD_SHIPPING_FEE;
  // Retail LKR prices are inclusive of Sri Lanka 18% VAT
  const includedVat = roundCurrency(subtotal - subtotal / (1 + VAT_RATE));
  const total = roundCurrency(subtotal + shipping);
  const remainingForFreeShipping = roundCurrency(Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal));
  const freeShippingProgressPct = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100)
  );

  return {
    itemCount,
    subtotal,
    shipping,
    tax: includedVat,
    total,
    remainingForFreeShipping,
    freeShippingProgressPct,
  };
}

export function validateCheckoutForm(
  form: CheckoutFormData
): Partial<Record<keyof CheckoutFormData, string>> {
  const errors: Partial<Record<keyof CheckoutFormData, string>> = {};
  if (!form.fullName.trim() || form.fullName.trim().length < 2) {
    errors.fullName = 'Enter recipient or site contact name.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address for order confirmation.';
  }
  if (form.phone.replace(/\D/g, '').length < 9) {
    errors.phone = 'Enter a valid Sri Lankan contact number (e.g. 077 234 8910).';
  }
  if (form.paymentMethod !== 'pickup') {
    if (!form.address.trim() || form.address.trim().length < 4) {
      errors.address = 'Enter a street, estate, or jobsite delivery address.';
    }
    if (!form.cityStateZip.trim() || form.cityStateZip.trim().length < 4) {
      errors.cityStateZip = 'Enter town, district, and postal code (e.g. Thalawakale 22100).';
    }
  }
  return errors;
}
