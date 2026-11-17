import { useEffect, useState } from 'react';
import { CheckCircle2, Minus, Plus, Store, Trash2, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import {
  CartItem,
  CheckoutFormData,
  SubmittedOrder,
} from '../types/store';
import {
  calculateCartTotals,
  formatCurrency,
  FREE_SHIPPING_THRESHOLD,
  validateCheckoutForm,
} from '../utils/pricing';
import { ProductImage } from './ProductImage';

interface CartQuoteDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateCartQty: (productId: string, variantId: string, delta: number) => void;
  onRemoveCartItem: (productId: string, variantId: string) => void;
  onClearCart: () => void;
  onOpenAccount: () => void;
}

const INITIAL_CHECKOUT: CheckoutFormData = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  cityStateZip: '',
  paymentMethod: 'card',
};

export function CartQuoteDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateCartQty,
  onRemoveCartItem,
  onClearCart,
  onOpenAccount,
}: CartQuoteDrawerProps) {
  const { user, profile, saveOrderToAccount } = useAuth();
  const [checkoutStep, setCheckoutStep] = useState<'bag' | 'form' | 'confirmed'>('bag');
  const [form, setForm] = useState<CheckoutFormData>(INITIAL_CHECKOUT);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [orderReceipt, setOrderReceipt] = useState<SubmittedOrder | null>(null);
  const [orderSavedToAccount, setOrderSavedToAccount] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (checkoutStep !== 'form' || (!user && !profile)) return;
    setForm((prev) => ({
      ...prev,
      fullName: prev.fullName || profile?.displayName || user?.displayName || '',
      email: prev.email || profile?.email || user?.email || '',
      phone: prev.phone || profile?.phone || '',
      address: prev.address || profile?.address || '',
      cityStateZip:
        prev.cityStateZip ||
        (profile?.postalCode ? `Thalawakale ${profile.postalCode}` : ''),
    }));
  }, [checkoutStep, user, profile]);

  if (!isOpen) return null;

  const cartTotals = calculateCartTotals(cartItems, form.paymentMethod);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateCheckoutForm(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    const seq = String(Math.floor(1000 + (Date.now() % 9000)));
    const newOrder: SubmittedOrder = {
      orderNumber: `TEH-${seq}`,
      placedAt: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      customer: { ...form },
      items: cartItems.map((i) => ({ ...i })),
      subtotal: cartTotals.subtotal,
      shipping: cartTotals.shipping,
      tax: cartTotals.tax,
      total: cartTotals.total,
    };
    setOrderReceipt(newOrder);
    setOrderSavedToAccount(Boolean(user));
    if (user) {
      void saveOrderToAccount(newOrder).catch((err) => {
        console.error('Failed to save order to account:', err);
        setOrderSavedToAccount(false);
      });
    }
    onClearCart();
    setCheckoutStep('confirmed');
  };

  const resetAndClose = () => {
    setCheckoutStep('bag');
    setErrors({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-zinc-950/50 backdrop-blur-xs no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Order Cart Drawer"
      onClick={resetAndClose}
    >
      <div
        className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl border-l border-zinc-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-base text-zinc-950">
              Order Cart ({cartTotals.itemCount})
            </h2>
            <p className="text-[11px] text-zinc-500">
              Prices incl. 18% VAT · Free counter pickup
            </p>
          </div>

          <button
            type="button"
            onClick={resetAndClose}
            aria-label="Close order cart drawer"
            className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        {checkoutStep === 'confirmed' && orderReceipt ? (
          <div className="flex-1 overflow-y-auto p-6 flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-emerald-700 text-sm font-semibold mb-2">
                <CheckCircle2 className="w-5 h-5" />
                <span>Order #{orderReceipt.orderNumber} Confirmed</span>
              </div>
              <h3 className="font-display font-bold text-2xl text-zinc-950 mb-2">
                {orderReceipt.customer.paymentMethod === 'pickup'
                  ? 'Ready for Counter Pickup'
                  : 'Preparing Dispatch'}
              </h3>
              <p className="text-sm text-zinc-600 mb-4">
                Confirmation sent to{' '}
                <span className="font-medium text-zinc-900">{orderReceipt.customer.email}</span>.{' '}
                {orderReceipt.customer.paymentMethod === 'pickup'
                  ? 'Ready within 2 hours at No. 42, Main Street, Thalawakale 22100.'
                  : `Dispatching to ${orderReceipt.customer.address}, ${orderReceipt.customer.cityStateZip}.`}
              </p>

              {orderSavedToAccount ? (
                <p className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg mb-5">
                  Saved to your account order history.
                </p>
              ) : (
                <button
                  type="button"
                  onClick={onOpenAccount}
                  className="mb-5 text-xs font-semibold text-zinc-700 hover:text-zinc-950 underline inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Sign in to track orders &amp; save details</span>
                </button>
              )}

              <div className="border border-zinc-200 rounded-xl divide-y divide-zinc-200 mb-6">
                {orderReceipt.items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="p-3.5 flex items-center justify-between text-xs gap-3"
                  >
                    <div>
                      <p className="font-semibold text-zinc-900">{item.name}</p>
                      <p className="text-zinc-500">
                        {item.variantLabel} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-mono tabular-nums font-semibold text-zinc-950 whitespace-nowrap shrink-0">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <dl className="space-y-2 text-sm border-t border-zinc-200 pt-4">
                <div className="flex justify-between text-zinc-600">
                  <dt>Subtotal</dt>
                  <dd className="font-mono tabular-nums whitespace-nowrap">
                    {formatCurrency(orderReceipt.subtotal)}
                  </dd>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <dt>Delivery / Pickup</dt>
                  <dd className="font-mono tabular-nums whitespace-nowrap">
                    {orderReceipt.shipping === 0 ? 'FREE' : formatCurrency(orderReceipt.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <dt>Incl. 18% VAT</dt>
                  <dd className="font-mono tabular-nums whitespace-nowrap">
                    {formatCurrency(orderReceipt.tax)}
                  </dd>
                </div>
                <div className="flex justify-between font-bold text-zinc-950 text-base pt-2 border-t border-zinc-200">
                  <dt>Total Payable</dt>
                  <dd className="font-mono tabular-nums whitespace-nowrap">
                    {formatCurrency(orderReceipt.total)}
                  </dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              onClick={resetAndClose}
              className="w-full h-11 mt-6 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-md cursor-pointer"
            >
              Continue Browsing Catalog
            </button>
          </div>
        ) : checkoutStep === 'form' ? (
          <form
            onSubmit={handlePlaceOrder}
            noValidate
            className="flex-1 overflow-y-auto p-6 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-zinc-950">
                  Delivery &amp; Payment
                </h3>
                <button
                  type="button"
                  onClick={() => setCheckoutStep('bag')}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-950 underline cursor-pointer"
                >
                  Back to Cart
                </button>
              </div>

              <div>
                <label htmlFor="chk-name" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Full Name / Site Contact
                </label>
                <input
                  id="chk-name"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  placeholder="Kasun Perera"
                  className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="chk-email" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Email for Order Receipt
                </label>
                <input
                  id="chk-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="kasun@hillcountrymep.lk"
                  className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="chk-phone" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Mobile / WhatsApp Number
                </label>
                <input
                  id="chk-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="077 234 8910"
                  className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                />
                {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label htmlFor="chk-pay" className="block text-xs font-semibold text-zinc-700 mb-1">
                  Payment &amp; Fulfillment Method
                </label>
                <select
                  id="chk-pay"
                  value={form.paymentMethod}
                  onChange={(e) => {
                    setErrors({});
                    setForm({
                      ...form,
                      paymentMethod: e.target.value as CheckoutFormData['paymentMethod'],
                    });
                  }}
                  className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                >
                  <option value="card">Visa / Mastercard / LankaQR</option>
                  <option value="cod">Cash on Delivery (COD)</option>
                  <option value="pickup">Pay at Thalawakale Counter (Free Pickup)</option>
                  <option value="net30">Bank Transfer / Estate Trade Credit</option>
                </select>
              </div>

              {form.paymentMethod === 'pickup' ? (
                <div
                  data-testid="pickup-info-box"
                  className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-xs text-zinc-800"
                >
                  <Store className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-zinc-950">
                      Collect at No. 42, Main Street, Thalawakale
                    </p>
                    <p className="text-zinc-600 mt-0.5">
                      Ready within 2 hours · Free counter pickup (LKR 0 delivery fee).
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div>
                    <label htmlFor="chk-address" className="block text-xs font-semibold text-zinc-700 mb-1">
                      Street, Estate or Jobsite Address
                    </label>
                    <input
                      id="chk-address"
                      type="text"
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      placeholder="No. 42, Main Street"
                      className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                    />
                    {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address}</p>}
                  </div>

                  <div>
                    <label htmlFor="chk-city" className="block text-xs font-semibold text-zinc-700 mb-1">
                      Town, District &amp; Postal Code
                    </label>
                    <input
                      id="chk-city"
                      type="text"
                      value={form.cityStateZip}
                      onChange={(e) => setForm({ ...form, cityStateZip: e.target.value })}
                      placeholder="Thalawakale 22100"
                      className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                    />
                    {errors.cityStateZip && (
                      <p className="text-xs text-red-600 mt-1">{errors.cityStateZip}</p>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-5 mt-6 border-t border-zinc-200">
              <div className="flex justify-between text-xs text-zinc-600 mb-1.5">
                <span>Delivery / Pickup</span>
                <span className="font-mono tabular-nums font-medium text-zinc-900">
                  {cartTotals.shipping === 0 ? 'FREE' : formatCurrency(cartTotals.shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-950 mb-4">
                <span>Order Total (Incl. 18% VAT)</span>
                <span className="font-mono tabular-nums whitespace-nowrap">
                  {formatCurrency(cartTotals.total)}
                </span>
              </div>
              <button
                type="submit"
                className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-bold rounded-md cursor-pointer"
              >
                Confirm &amp; Place Order
              </button>
            </div>
          </form>
        ) : (
          <>
            {/* Free Shipping Progress */}
            <div className="px-6 py-3.5 bg-zinc-50 border-b border-zinc-200">
              <div className="flex justify-between text-xs font-medium text-zinc-700 mb-2">
                <span>
                  {cartTotals.remainingForFreeShipping === 0 && cartTotals.subtotal > 0
                    ? 'Unlocked: Free island-wide delivery'
                    : `Add ${formatCurrency(cartTotals.remainingForFreeShipping)} for free delivery (${formatCurrency(FREE_SHIPPING_THRESHOLD)})`}
                </span>
                <span className="font-mono tabular-nums">{cartTotals.freeShippingProgressPct}%</span>
              </div>
              <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${cartTotals.freeShippingProgressPct}%` }}
                />
              </div>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12">
                  <p className="font-display font-bold text-lg text-zinc-900 mb-1">
                    Your order cart is empty
                  </p>
                  <p className="text-sm text-zinc-500 max-w-xs mb-5">
                    Browse brushless tools, DB boards, uPVC plumbing, water pumps, brass locks, or SLS 733 copper cables to start an order.
                  </p>
                  <button
                    type="button"
                    onClick={resetAndClose}
                    className="px-5 py-2.5 bg-zinc-950 text-white text-xs font-semibold rounded-md cursor-pointer"
                  >
                    Browse Catalog
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-zinc-200">
                  {cartItems.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="py-4 flex gap-4 items-start"
                    >
                      <div className="w-18 h-18 bg-zinc-100 rounded-lg p-2 shrink-0 flex items-center justify-center">
                        <ProductImage
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-mono text-zinc-500">{item.sku}</p>
                        <h4 className="font-semibold text-sm text-zinc-950 leading-snug">
                          {item.name}
                        </h4>
                        <p className="text-xs text-zinc-500 mb-2">{item.variantLabel}</p>

                        <div className="flex items-center justify-between gap-2">
                          <div className="inline-flex items-center border border-zinc-300 rounded-md h-8">
                            <button
                              type="button"
                              onClick={() => onUpdateCartQty(item.productId, item.variantId, -1)}
                              aria-label={`Decrease quantity of ${item.name}`}
                              className="w-7 h-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center font-mono tabular-nums text-xs font-semibold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateCartQty(item.productId, item.variantId, 1)}
                              aria-label={`Increase quantity of ${item.name}`}
                              className="w-7 h-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="font-mono tabular-nums text-sm font-bold text-zinc-950 whitespace-nowrap">
                              {formatCurrency(item.unitPrice * item.quantity)}
                            </span>
                            <button
                              type="button"
                              onClick={() => onRemoveCartItem(item.productId, item.variantId)}
                              aria-label={`Remove ${item.name} from cart`}
                              className="p-1 text-zinc-400 hover:text-red-600 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-zinc-200 bg-zinc-50 space-y-4">
                <dl className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <dt>Subtotal</dt>
                    <dd className="font-mono tabular-nums font-medium text-zinc-900 whitespace-nowrap">
                      {formatCurrency(cartTotals.subtotal)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <dt>Estimated Delivery</dt>
                    <dd className="font-mono tabular-nums font-medium text-zinc-900 whitespace-nowrap">
                      {cartTotals.shipping === 0 ? 'FREE' : formatCurrency(cartTotals.shipping)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-zinc-600">
                    <dt>Incl. 18% VAT</dt>
                    <dd className="font-mono tabular-nums font-medium text-zinc-900 whitespace-nowrap">
                      {formatCurrency(cartTotals.tax)}
                    </dd>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-zinc-950 pt-2 border-t border-zinc-200">
                    <dt>Estimated Total</dt>
                    <dd className="font-mono tabular-nums whitespace-nowrap">
                      {formatCurrency(cartTotals.total)}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  onClick={() => setCheckoutStep('form')}
                  className="w-full h-11 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-bold rounded-md transition-colors cursor-pointer"
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
