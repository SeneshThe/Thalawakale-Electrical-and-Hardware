import { useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { Product } from '../types/store';
import { formatCurrency } from '../utils/pricing';
import { ProductImage } from './ProductImage';

interface CompareModalProps {
  isOpen: boolean;
  products: Product[];
  onClose: () => void;
  onRemoveProduct: (productId: string) => void;
  onAddToCart: (product: Product) => void;
}

export function CompareModal({
  isOpen,
  products,
  onClose,
  onRemoveProduct,
  onAddToCart,
}: CompareModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || products.length === 0) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="compare-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-zinc-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div>
            <h2
              id="compare-modal-title"
              className="font-display font-bold text-base text-zinc-950"
            >
              Side-by-Side Spec Comparison ({products.length})
            </h2>
            <p className="text-[11px] text-zinc-500">
              Compare standards, ratings, warranties, and LKR VAT-inclusive pricing
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close comparison modal"
            className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-x-auto">
          <div
            className="grid gap-4 min-w-[540px]"
            style={{ gridTemplateColumns: `repeat(${products.length}, minmax(0, 1fr))` }}
          >
            {products.map((product) => (
              <div
                key={product.id}
                className="border border-zinc-200 rounded-xl overflow-hidden flex flex-col justify-between bg-zinc-50"
              >
                <div>
                  <div className="relative aspect-[4/3] bg-[#e3e3e3] p-3 flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => onRemoveProduct(product.id)}
                      aria-label={`Remove ${product.shortName} from compare`}
                      className="absolute top-2 right-2 w-7 h-7 rounded-md bg-white/90 hover:bg-red-50 text-zinc-600 hover:text-red-600 flex items-center justify-center border border-zinc-200 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <ProductImage
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-contain"
                      fallbackLabel={product.shortName}
                    />
                  </div>

                  <div className="p-4 bg-white border-t border-zinc-200 space-y-3">
                    <div>
                      <p className="text-[11px] font-mono text-zinc-500">
                        {product.sku} · {product.categoryLabel}
                      </p>
                      <h3 className="font-semibold text-sm text-zinc-950 leading-snug mt-0.5 min-h-[2.5rem]">
                        {product.name}
                      </h3>
                      <p className="font-mono tabular-nums text-base font-bold text-zinc-950 mt-1.5">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <dl className="border-t border-zinc-200 pt-2.5 space-y-2 text-xs">
                      <div>
                        <dt className="text-zinc-500">Compliance</dt>
                        <dd className="font-mono font-semibold text-zinc-900">
                          {product.compliance}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500">Warranty</dt>
                        <dd className="text-zinc-800">{product.warranty}</dd>
                      </div>
                      {product.specs.map((spec) => (
                        <div key={spec.label}>
                          <dt className="text-zinc-500">{spec.label}</dt>
                          <dd className="font-mono font-medium text-zinc-900">
                            {spec.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </div>

                <div className="p-3 bg-white border-t border-zinc-200">
                  <button
                    type="button"
                    onClick={() => onAddToCart(product)}
                    className="w-full py-2 px-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold rounded-md transition-colors cursor-pointer"
                  >
                    Add to Order Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
