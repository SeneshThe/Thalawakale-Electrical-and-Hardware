import { useEffect, useState } from 'react';
import { Bookmark, Check, Minus, Plus, ShieldCheck, Store, X } from 'lucide-react';
import { Product, ProductVariant } from '../types/store';
import { formatCurrency } from '../utils/pricing';
import { ProductImage } from './ProductImage';

interface ProductDetailModalProps {
  product: Product | null;
  isSaved?: boolean;
  onToggleSaved?: (product: Product) => void;
  onClose: () => void;
  onAddToCart: (product: Product, variant: ProductVariant, quantity: number) => void;
}

export function ProductDetailModal({
  product,
  isSaved = false,
  onToggleSaved,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (product) {
      setSelectedVariantId(product.variants[0]?.id ?? '');
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    if (!product) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [product, onClose]);

  if (!product) return null;

  const activeVariant =
    product.variants.find((v) => v.id === selectedVariantId) ?? product.variants[0];
  const unitPrice = Math.max(1, product.price + (activeVariant?.priceDelta ?? 0));
  const fullSku = `${product.sku}-${activeVariant?.skuSuffix ?? 'STD'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-[920px] w-full overflow-hidden shadow-2xl border border-zinc-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200">
          <div className="text-xs font-mono text-zinc-500">
            {fullSku} · {product.categoryLabel}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product specification modal"
            className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Left: Studio Image & Compliance */}
          <div className="md:col-span-5 bg-[#e3e3e3] p-4 sm:p-6 flex flex-col justify-between">
            <div className="aspect-square flex items-center justify-center">
              <ProductImage
                src={product.image}
                alt={product.name}
                className="w-full h-full object-contain"
                fallbackLabel={product.shortName}
              />
            </div>
            <div className="mt-6 pt-4 border-t border-zinc-200 text-xs text-zinc-600 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-zinc-800">
                <ShieldCheck className="w-4 h-4 text-zinc-900 shrink-0" />
                <span>{product.compliance}</span>
              </div>
              <p className="text-zinc-500">{product.warranty}</p>
            </div>
          </div>

          {/* Right: Contiguous Purchase & Specs Module */}
          <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between min-w-0">
            <div>
              <h2
                id="pdp-modal-title"
                className="font-display font-bold text-2xl text-zinc-950 leading-snug mb-2"
              >
                {product.name}
              </h2>

              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 mb-4">
                <span className="font-mono tabular-nums text-2xl font-bold text-zinc-950 whitespace-nowrap">
                  {formatCurrency(unitPrice)}
                </span>
                {product.compareAtPrice && activeVariant?.priceDelta === 0 && (
                  <span className="font-mono tabular-nums text-sm text-zinc-400 line-through whitespace-nowrap">
                    {formatCurrency(product.compareAtPrice)}
                  </span>
                )}
                <span className="text-xs font-mono text-zinc-600 whitespace-nowrap">
                  · {activeVariant?.stockCount ?? 15} in stock · Incl. 18% VAT
                </span>
              </div>

              <p className="text-sm text-zinc-600 leading-relaxed mb-5">
                {product.summary}
              </p>

              {/* Variant Selector */}
              <div className="mb-5">
                <span className="block text-xs font-semibold text-zinc-800 mb-2">
                  Configuration / Sizing
                </span>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((variant) => {
                    const selected = variant.id === activeVariant?.id;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => setSelectedVariantId(variant.id)}
                        className={`px-3 py-2 rounded-md text-xs font-semibold border transition-colors inline-flex items-center gap-1.5 cursor-pointer ${
                          selected
                            ? 'bg-zinc-950 text-white border-zinc-950'
                            : 'bg-white text-zinc-800 border-zinc-300 hover:border-zinc-950'
                        }`}
                      >
                        {selected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{variant.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Technical Electrical Specs Table */}
              <div className="mb-4">
                <span className="block text-xs font-semibold text-zinc-800 mb-2">
                  Technical Specifications
                </span>
                <dl className="border border-zinc-200 rounded-lg divide-y divide-zinc-200 bg-zinc-50">
                  {product.specs.map((spec) => (
                    <div
                      key={spec.label}
                      className="px-3.5 py-2 flex items-center justify-between gap-4 text-xs"
                    >
                      <dt className="text-zinc-500">{spec.label}</dt>
                      <dd className="font-mono tabular-nums font-semibold text-zinc-900">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Sri Lankan Counter Pickup & Bulk Desk Assurance */}
              <div className="mb-6 px-3.5 py-2.5 bg-amber-50 border border-amber-200/80 rounded-lg flex items-start gap-2.5 text-xs">
                <Store className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-zinc-950">
                    Same-Day Pickup &amp; Island-Wide Dispatch
                  </p>
                  <p className="text-zinc-600 text-[11px] mt-0.5">
                    Ready in 2 hours at No. 42, Main St, Thalawakale · Call +94 51 222 4190 for estate &amp; trade enquiries.
                  </p>
                </div>
              </div>
            </div>

            {/* Quantity & Action Button */}
            <div className="pt-4 border-t border-zinc-200 flex flex-wrap items-center gap-2.5">
              <div className="inline-flex items-center border border-zinc-300 rounded-md h-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="w-8 h-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-mono tabular-nums text-sm font-semibold">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  aria-label="Increase quantity"
                  className="w-8 h-full flex items-center justify-center text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, activeVariant, quantity);
                  onClose();
                }}
                className="flex-1 min-w-[200px] h-10 px-4 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap cursor-pointer"
              >
                Add to Order Cart · {formatCurrency(unitPrice * quantity)}
              </button>

              {onToggleSaved && (
                <button
                  type="button"
                  onClick={() => onToggleSaved(product)}
                  aria-label={isSaved ? 'Remove from saved items' : 'Save item for later'}
                  aria-pressed={isSaved}
                  className={`h-10 px-3.5 rounded-md border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                    isSaved
                      ? 'bg-zinc-950 border-zinc-950 text-amber-400'
                      : 'bg-white hover:bg-zinc-50 border-zinc-300 text-zinc-800'
                  }`}
                >
                  <Bookmark
                    className="w-3.5 h-3.5"
                    fill={isSaved ? 'currentColor' : 'none'}
                  />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
