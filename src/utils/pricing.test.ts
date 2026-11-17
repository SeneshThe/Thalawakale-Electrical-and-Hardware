import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCartTotals,
  formatCurrency,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  validateCheckoutForm,
} from './pricing';

test('formatCurrency formats values clearly in LKR', () => {
  assert.equal(formatCurrency(74500), 'LKR 74,500.00');
  assert.equal(formatCurrency(1500), 'LKR 1,500.00');
});

test('calculateCartTotals uses VAT-inclusive pricing, free delivery at LKR 45,000, and free counter pickup', () => {
  const underThreshold = calculateCartTotals([
    {
      productId: 'led',
      variantId: 'single',
      sku: 'TEH-LED-050-50W',
      name: '50W IP65 LED Floodlight',
      variantLabel: 'Single 50W Portable Unit',
      unitPrice: 33500,
      quantity: 1,
      image: '/img.jpg',
    },
  ]);

  assert.equal(underThreshold.subtotal, 33500);
  assert.equal(underThreshold.shipping, STANDARD_SHIPPING_FEE);
  // Tax is included in retail LKR prices, never added on top
  assert.equal(underThreshold.tax, 5110.17);
  assert.equal(underThreshold.total, 33500 + STANDARD_SHIPPING_FEE);
  assert.equal(underThreshold.remainingForFreeShipping, FREE_SHIPPING_THRESHOLD - 33500);

  // Counter pickup waives shipping even under LKR 45,000
  const counterPickup = calculateCartTotals(
    [
      {
        productId: 'led',
        variantId: 'single',
        sku: 'TEH-LED-050-50W',
        name: '50W IP65 LED Floodlight',
        variantLabel: 'Single 50W Portable Unit',
        unitPrice: 33500,
        quantity: 1,
        image: '/img.jpg',
      },
    ],
    'pickup'
  );
  assert.equal(counterPickup.shipping, 0);
  assert.equal(counterPickup.total, 33500);

  const freeShipping = calculateCartTotals([
    {
      productId: 'drill',
      variantId: 'kit-5ah',
      sku: 'TEH-DRL-20V-K1',
      name: '20V Rotary Hammer',
      variantLabel: '5.0Ah Kit',
      unitPrice: 74500,
      quantity: 1,
      image: '/img.jpg',
    },
  ]);
  assert.equal(freeShipping.shipping, 0);
  assert.equal(freeShipping.freeShippingProgressPct, 100);
  assert.equal(freeShipping.total, 74500);
});

test('validateCheckoutForm enforces address for delivery and skips address check for counter pickup', () => {
  const invalidDelivery = validateCheckoutForm({
    fullName: 'A',
    email: 'bad',
    phone: '123',
    address: '',
    cityStateZip: '',
    paymentMethod: 'card',
  });
  assert.ok(invalidDelivery.fullName);
  assert.ok(invalidDelivery.email);
  assert.ok(invalidDelivery.phone);
  assert.ok(invalidDelivery.address);
  assert.ok(invalidDelivery.cityStateZip);

  const validPickup = validateCheckoutForm({
    fullName: 'Kasun Perera',
    email: 'kasun@hillcountrymep.lk',
    phone: '077 234 8910',
    address: '',
    cityStateZip: '',
    paymentMethod: 'pickup',
  });
  assert.deepEqual(validPickup, {});
});
