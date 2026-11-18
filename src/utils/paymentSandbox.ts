import { CheckoutFormData, PaymentTransaction } from '../types/store';

export interface SandboxCardPreset {
  id: string;
  label: string;
  number: string;
  expiry: string;
  cvc: string;
  outcome: 'approve' | 'decline' | 'timeout';
}

export const SANDBOX_TEST_CARDS: SandboxCardPreset[] = [
  {
    id: 'visa-approve',
    label: 'Visa Approve •4242',
    number: '4242 4242 4242 4242',
    expiry: '08/29',
    cvc: '424',
    outcome: 'approve',
  },
  {
    id: 'mc-approve',
    label: 'Mastercard •5555',
    number: '5555 5555 5555 4444',
    expiry: '11/28',
    cvc: '555',
    outcome: 'approve',
  },
  {
    id: 'card-decline',
    label: 'Decline •0002',
    number: '4000 0000 0000 0002',
    expiry: '06/28',
    cvc: '102',
    outcome: 'decline',
  },
  {
    id: 'card-timeout',
    label: 'Timeout •9995',
    number: '4000 0000 0000 9995',
    expiry: '09/28',
    cvc: '995',
    outcome: 'timeout',
  },
];

export interface SandboxCardInput {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

export type CardBrand = 'Visa' | 'Mastercard' | 'Card';

export function detectCardBrand(cardNumber: string): CardBrand {
  const digits = cardNumber.replace(/\D/g, '');
  if (digits.startsWith('4')) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  return 'Card';
}

export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatCardExpiry(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export function validateSandboxCard(
  input: SandboxCardInput
): Partial<Record<keyof SandboxCardInput, string>> {
  const errors: Partial<Record<keyof SandboxCardInput, string>> = {};
  if (input.cardholderName.trim().length < 2) {
    errors.cardholderName = 'Enter name printed on the test card.';
  }
  const digits = input.cardNumber.replace(/\D/g, '');
  if (digits.length !== 16) {
    errors.cardNumber = 'Enter a 16-digit sandbox card number.';
  }
  const expiryMatch = /^(\d{2})\/(\d{2})$/.exec(input.expiry.trim());
  if (!expiryMatch) {
    errors.expiry = 'Use MM/YY format.';
  } else {
    const month = Number(expiryMatch[1]);
    const year = Number(expiryMatch[2]);
    if (month < 1 || month > 12 || year < 25) {
      errors.expiry = 'Enter a valid future expiry.';
    }
  }
  const cvcDigits = input.cvc.replace(/\D/g, '');
  if (cvcDigits.length < 3 || cvcDigits.length > 4) {
    errors.cvc = 'Enter 3–4 digit CVC.';
  }
  return errors;
}

function generateSandboxRef(): string {
  const suffix = String(Math.floor(100000 + (Date.now() % 900000)));
  return `SBX-${suffix}`;
}

export type SandboxGatewayResponse =
  | { ok: true; transaction: PaymentTransaction }
  | { ok: false; errorCode: string; message: string };

export function evaluateSandboxCardPayment(
  input: SandboxCardInput
): SandboxGatewayResponse {
  const digits = input.cardNumber.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  const brand = detectCardBrand(digits);

  if (last4 === '0002') {
    return {
      ok: false,
      errorCode: 'CARD_DECLINED_3DS',
      message: 'Sandbox issuer declined transaction (3D-Secure / insufficient limit). Try •4242 or LankaQR.',
    };
  }

  if (last4 === '9995') {
    return {
      ok: false,
      errorCode: 'GATEWAY_TIMEOUT',
      message: 'Sandbox bank gateway timed out waiting for authorization. Please retry or switch rail.',
    };
  }

  return {
    ok: true,
    transaction: {
      transactionId: generateSandboxRef(),
      gateway: 'card-sandbox',
      paymentStatus: 'paid_sandbox',
      paymentChannel: `${brand} •••• ${last4 || '4242'} (Sandbox)`,
      authorizedAt: new Date().toISOString(),
    },
  };
}

export function evaluateSandboxQrPayment(
  outcome: 'approve' | 'decline'
): SandboxGatewayResponse {
  if (outcome === 'decline') {
    return {
      ok: false,
      errorCode: 'LANKAQR_EXPIRED',
      message: 'LankaQR test session expired or cancelled by mobile banking app. Generate/retry scan.',
    };
  }

  return {
    ok: true,
    transaction: {
      transactionId: generateSandboxRef(),
      gateway: 'lankaqr-sandbox',
      paymentStatus: 'paid_sandbox',
      paymentChannel: 'LankaQR Sandbox',
      authorizedAt: new Date().toISOString(),
    },
  };
}

export function buildOfflinePaymentTransaction(
  paymentMethod: Exclude<CheckoutFormData['paymentMethod'], 'card'>
): PaymentTransaction {
  if (paymentMethod === 'pickup') {
    return {
      transactionId: 'CTR-PICKUP',
      gateway: 'offline-counter',
      paymentStatus: 'pending_pickup',
      paymentChannel: 'Pay at Thalawakale Counter',
      authorizedAt: new Date().toISOString(),
    };
  }

  if (paymentMethod === 'net30') {
    return {
      transactionId: 'TRD-NET30',
      gateway: 'trade-credit',
      paymentStatus: 'pending_net30',
      paymentChannel: 'Bank Transfer / Estate Trade',
      authorizedAt: new Date().toISOString(),
    };
  }

  return {
    transactionId: 'COD-DELIVERY',
    gateway: 'offline-counter',
    paymentStatus: 'pending_cod',
    paymentChannel: 'Cash on Delivery (COD)',
    authorizedAt: new Date().toISOString(),
  };
}
