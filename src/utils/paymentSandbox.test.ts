import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOfflinePaymentTransaction,
  detectCardBrand,
  evaluateSandboxCardPayment,
  evaluateSandboxQrPayment,
  formatCardExpiry,
  formatCardNumber,
  validateSandboxCard,
} from './paymentSandbox';

test('formatCardNumber, formatCardExpiry, and detectCardBrand format test cards accurately', () => {
  assert.equal(formatCardNumber('4242424242424242'), '4242 4242 4242 4242');
  assert.equal(formatCardExpiry('0829'), '08/29');
  assert.equal(detectCardBrand('4242 4242 4242 4242'), 'Visa');
  assert.equal(detectCardBrand('5555 5555 5555 4444'), 'Mastercard');
});

test('validateSandboxCard rejects incomplete fields and accepts valid sandbox inputs', () => {
  const invalid = validateSandboxCard({
    cardholderName: 'A',
    cardNumber: '4242',
    expiry: '13/20',
    cvc: '12',
  });
  assert.ok(invalid.cardholderName);
  assert.ok(invalid.cardNumber);
  assert.ok(invalid.expiry);
  assert.ok(invalid.cvc);

  const valid = validateSandboxCard({
    cardholderName: 'Kasun Perera',
    cardNumber: '4242 4242 4242 4242',
    expiry: '08/29',
    cvc: '424',
  });
  assert.deepEqual(valid, {});
});

test('evaluateSandboxCardPayment simulates approval, issuer decline, and timeout accurately', () => {
  const approved = evaluateSandboxCardPayment({
    cardholderName: 'Kasun Perera',
    cardNumber: '4242 4242 4242 4242',
    expiry: '08/29',
    cvc: '424',
  });
  assert.equal(approved.ok, true);
  if (approved.ok) {
    assert.equal(approved.transaction.paymentStatus, 'paid_sandbox');
    assert.match(approved.transaction.transactionId, /^SBX-\d{6}$/);
    assert.equal(approved.transaction.paymentChannel, 'Visa •••• 4242 (Sandbox)');
  }

  const declined = evaluateSandboxCardPayment({
    cardholderName: 'Kasun Perera',
    cardNumber: '4000 0000 0000 0002',
    expiry: '06/28',
    cvc: '102',
  });
  assert.equal(declined.ok, false);
  if (!declined.ok) {
    assert.equal(declined.errorCode, 'CARD_DECLINED_3DS');
  }

  const timeout = evaluateSandboxCardPayment({
    cardholderName: 'Kasun Perera',
    cardNumber: '4000 0000 0000 9995',
    expiry: '09/28',
    cvc: '995',
  });
  assert.equal(timeout.ok, false);
  if (!timeout.ok) {
    assert.equal(timeout.errorCode, 'GATEWAY_TIMEOUT');
  }
});

test('evaluateSandboxQrPayment and buildOfflinePaymentTransaction return structured results', () => {
  const qrOk = evaluateSandboxQrPayment('approve');
  assert.equal(qrOk.ok, true);
  if (qrOk.ok) {
    assert.equal(qrOk.transaction.gateway, 'lankaqr-sandbox');
    assert.equal(qrOk.transaction.paymentChannel, 'LankaQR Sandbox');
  }

  const qrFail = evaluateSandboxQrPayment('decline');
  assert.equal(qrFail.ok, false);

  const pickup = buildOfflinePaymentTransaction('pickup');
  assert.equal(pickup.paymentStatus, 'pending_pickup');
});
