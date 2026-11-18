import { useEffect, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Loader2,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { PaymentTransaction } from '../types/store';
import { formatCurrency } from '../utils/pricing';
import {
  detectCardBrand,
  evaluateSandboxCardPayment,
  evaluateSandboxQrPayment,
  formatCardExpiry,
  formatCardNumber,
  SANDBOX_TEST_CARDS,
  SandboxCardInput,
  SandboxCardPreset,
  validateSandboxCard,
} from '../utils/paymentSandbox';

interface PaymentGatewaySandboxProps {
  amount: number;
  customerName: string;
  onBack: () => void;
  onAuthorized: (transaction: PaymentTransaction) => void;
}

const QR_MATRIX = [
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
  [0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0],
  [1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0],
  [1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1],
];

export function PaymentGatewaySandbox({
  amount,
  customerName,
  onBack,
  onAuthorized,
}: PaymentGatewaySandboxProps) {
  const [rail, setRail] = useState<'card' | 'lankaqr'>('card');
  const [cardInput, setCardInput] = useState<SandboxCardInput>({
    cardholderName: customerName || 'Kasun Perera',
    cardNumber: SANDBOX_TEST_CARDS[0].number,
    expiry: SANDBOX_TEST_CARDS[0].expiry,
    cvc: SANDBOX_TEST_CARDS[0].cvc,
  });
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof SandboxCardInput, string>>
  >({});
  const [gatewayError, setGatewayError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    return () => setProcessing(false);
  }, []);

  const brand = detectCardBrand(cardInput.cardNumber);

  const applyPreset = (preset: SandboxCardPreset) => {
    setGatewayError(null);
    setFieldErrors({});
    setCardInput((prev) => ({
      ...prev,
      cardNumber: preset.number,
      expiry: preset.expiry,
      cvc: preset.cvc,
    }));
  };

  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGatewayError(null);
    const validation = validateSandboxCard(cardInput);
    setFieldErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setProcessing(true);
    window.setTimeout(() => {
      const response = evaluateSandboxCardPayment(cardInput);
      setProcessing(false);
      if (response.ok) {
        onAuthorized(response.transaction);
      } else {
        setGatewayError(`${response.errorCode}: ${response.message}`);
      }
    }, 650);
  };

  const handleQrOutcome = (outcome: 'approve' | 'decline') => {
    setGatewayError(null);
    setProcessing(true);
    window.setTimeout(() => {
      const response = evaluateSandboxQrPayment(outcome);
      setProcessing(false);
      if (response.ok) {
        onAuthorized(response.transaction);
      } else {
        setGatewayError(`${response.errorCode}: ${response.message}`);
      }
    }, 650);
  };

  return (
    <div
      data-testid="payment-gateway-sandbox"
      className="flex-1 overflow-y-auto p-6 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* Sandbox Top Bar */}
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={processing}
            onClick={onBack}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Delivery</span>
          </button>

          <span className="px-2 py-0.5 rounded bg-amber-100 border border-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900">
            Sandbox Test Mode
          </span>
        </div>

        {/* Merchant Summary Box */}
        <div className="p-4 rounded-xl bg-zinc-950 text-white flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-mono text-zinc-400">
              Thalawakale Electrical &amp; Hardware
            </p>
            <p className="text-xs text-zinc-300 mt-0.5">
              Simulated checkout · No real funds charged
            </p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-mono uppercase text-zinc-400">Payable</p>
            <p className="font-mono tabular-nums text-lg font-bold text-amber-400 whitespace-nowrap">
              {formatCurrency(amount)}
            </p>
          </div>
        </div>

        {/* Payment Rail Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-lg border border-zinc-200">
          <button
            type="button"
            disabled={processing}
            onClick={() => {
              setRail('card');
              setGatewayError(null);
            }}
            className={`py-2 px-3 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              rail === 'card'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Visa / Mastercard</span>
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={() => {
              setRail('lankaqr');
              setGatewayError(null);
            }}
            className={`py-2 px-3 rounded-md text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              rail === 'lankaqr'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>LankaQR Pay</span>
          </button>
        </div>

        {gatewayError && (
          <div
            role="alert"
            className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{gatewayError}</span>
          </div>
        )}

        {rail === 'card' ? (
          <form id="sandbox-card-form" onSubmit={handleCardSubmit} noValidate className="space-y-3.5">
            <div>
              <p className="text-[11px] font-semibold text-zinc-600 mb-1.5">
                Quick Sandbox Test Cards
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {SANDBOX_TEST_CARDS.map((preset) => {
                  const active = cardInput.cardNumber === preset.number;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      disabled={processing}
                      onClick={() => applyPreset(preset)}
                      className={`px-2.5 py-1.5 rounded-md border text-[11px] font-mono text-left transition-colors cursor-pointer ${
                        active
                          ? 'bg-zinc-950 text-amber-400 border-zinc-950 font-semibold'
                          : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border-zinc-200'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label htmlFor="sbx-holder" className="block text-xs font-semibold text-zinc-700 mb-1">
                Cardholder Name
              </label>
              <input
                id="sbx-holder"
                type="text"
                disabled={processing}
                value={cardInput.cardholderName}
                onChange={(e) =>
                  setCardInput((prev) => ({ ...prev, cardholderName: e.target.value }))
                }
                className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
              />
              {fieldErrors.cardholderName && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.cardholderName}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="sbx-number" className="text-xs font-semibold text-zinc-700">
                  Card Number
                </label>
                <span className="text-[11px] font-mono font-semibold text-zinc-500">
                  {brand}
                </span>
              </div>
              <input
                id="sbx-number"
                type="text"
                inputMode="numeric"
                disabled={processing}
                value={cardInput.cardNumber}
                onChange={(e) =>
                  setCardInput((prev) => ({
                    ...prev,
                    cardNumber: formatCardNumber(e.target.value),
                  }))
                }
                className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
              />
              {fieldErrors.cardNumber && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="sbx-expiry" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  id="sbx-expiry"
                  type="text"
                  inputMode="numeric"
                  disabled={processing}
                  value={cardInput.expiry}
                  onChange={(e) =>
                    setCardInput((prev) => ({
                      ...prev,
                      expiry: formatCardExpiry(e.target.value),
                    }))
                  }
                  className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                />
                {fieldErrors.expiry && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.expiry}</p>
                )}
              </div>

              <div>
                <label htmlFor="sbx-cvc" className="block text-xs font-semibold text-zinc-700 mb-1">
                  CVC
                </label>
                <input
                  id="sbx-cvc"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  disabled={processing}
                  value={cardInput.cvc}
                  onChange={(e) =>
                    setCardInput((prev) => ({
                      ...prev,
                      cvc: e.target.value.replace(/\D/g, '').slice(0, 4),
                    }))
                  }
                  className="w-full h-10 px-3 text-sm font-mono tabular-nums bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                />
                {fieldErrors.cvc && (
                  <p className="text-xs text-red-600 mt-1">{fieldErrors.cvc}</p>
                )}
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50 text-center space-y-3">
            <div className="inline-flex flex-col items-center p-3 bg-white rounded-xl border border-zinc-200 shadow-xs">
              <svg
                viewBox="0 0 21 21"
                className="w-36 h-36 text-zinc-950"
                role="img"
                aria-label="LankaQR Sandbox Test QR Code"
              >
                {QR_MATRIX.map((row, y) =>
                  row.map((cell, x) =>
                    cell === 1 ? (
                      <rect
                        key={`${x}-${y}`}
                        x={x}
                        y={y}
                        width="1"
                        height="1"
                        fill="currentColor"
                      />
                    ) : null
                  )
                )}
              </svg>
              <p className="mt-2 text-[11px] font-mono font-bold text-zinc-900">
                LANKAQR · TEH-22100
              </p>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              Compatible with BOC SmartPay, ComBank Q+, Sampath Vishwa, FriMi &amp; Genie. Choose a simulated bank response below:
            </p>

            <div className="grid grid-cols-1 gap-2 pt-1">
              <button
                type="button"
                disabled={processing}
                onClick={() => handleQrOutcome('approve')}
                className="w-full h-10 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-zinc-950 text-xs font-bold rounded-md inline-flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {processing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Simulate QR Scan &amp; Approve</span>
              </button>

              <button
                type="button"
                disabled={processing}
                onClick={() => handleQrOutcome('decline')}
                className="w-full h-9 px-4 bg-white hover:bg-zinc-100 disabled:opacity-60 text-zinc-700 border border-zinc-300 text-xs font-semibold rounded-md cursor-pointer"
              >
                Simulate QR Timeout / Decline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Security Note & Card Action */}
      <div className="pt-4 mt-5 border-t border-zinc-200 space-y-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>Sandbox simulation only — no real banking credentials required.</span>
        </div>

        {rail === 'card' && (
          <button
            type="submit"
            form="sandbox-card-form"
            disabled={processing}
            className="w-full h-11 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-zinc-950 text-sm font-bold rounded-md inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            {processing && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>
              {processing
                ? 'Authorizing Sandbox Payment...'
                : `Pay ${formatCurrency(amount)} (Sandbox)`}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}
