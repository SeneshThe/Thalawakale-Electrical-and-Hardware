import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Search, Store, X } from 'lucide-react';
import { CATEGORIES } from '../data/catalog';
import { CategoryId, Product } from '../types/store';
import { formatCurrency } from '../utils/pricing';
import { ProductImage } from './ProductImage';

export type SortOption = 'featured' | 'price-asc' | 'price-desc';

interface CatalogSectionProps {
  products: Product[];
  selectedCategory: CategoryId;
  searchQuery: string;
  sortBy: SortOption;
  cartQtyByProduct?: Record<string, number>;
  onSelectCategory: (category: CategoryId) => void;
  onSearchChange: (value: string) => void;
  onSortChange: (sort: SortOption) => void;
  onResetFilters: () => void;
  onAddToCart: (product: Product) => void;
  onInspectProduct: (product: Product) => void;
  onJumpToTradeSupply: () => void;
}

export function CatalogSection({
  products,
  selectedCategory,
  searchQuery,
  sortBy,
  cartQtyByProduct = {},
  onSelectCategory,
  onSearchChange,
  onSortChange,
  onResetFilters,
  onAddToCart,
  onInspectProduct,
  onJumpToTradeSupply,
}: CatalogSectionProps) {
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (!recentlyAddedId) return;
    const timer = window.setTimeout(() => setRecentlyAddedId(null), 1400);
    return () => window.clearTimeout(timer);
  }, [recentlyAddedId]);

  const showStoreDeskCard =
    selectedCategory === 'all' && searchQuery.trim() === '' && products.length === 7;

  return (
    <section id="catalog" className="py-12 lg:py-16 bg-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Controls */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
              Verified Stock · Prices Incl. 18% VAT
            </p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-zinc-950 tracking-tight">
              Online Hardware &amp; Electrical Catalog
            </h2>
          </div>

          {/* Search & Sort Toolbar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-72">
              <label htmlFor="catalog-search" className="sr-only">
                Search electrical and hardware catalog
              </label>
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="catalog-search"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search tool, SKU, SLS 733, 230V..."
                className="w-full h-10 pl-10 pr-9 text-sm bg-zinc-50 border border-zinc-300 rounded-md text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear catalog search"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-800 p-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <label htmlFor="catalog-sort" className="text-xs font-medium text-zinc-500 whitespace-nowrap">
                Sort by
              </label>
              <select
                id="catalog-sort"
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value as SortOption)}
                className="h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md text-zinc-900 focus:outline-none focus:border-zinc-950 cursor-pointer"
              >
                <option value="featured">Featured Stock</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Segmented Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-zinc-200">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-zinc-950 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950'
            }`}
          >
            All Equipment
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`px-3.5 py-2 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 hover:text-zinc-950'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Product Grid or Empty State */}
        {products.length === 0 ? (
          <div className="py-16 px-6 bg-zinc-50 border border-zinc-200 rounded-xl text-center">
            <p className="font-display font-bold text-lg text-zinc-900 mb-2">
              No hardware matched your current filter
            </p>
            <p className="text-sm text-zinc-600 max-w-md mx-auto mb-6">
              Try clearing your search query or switching back to all equipment categories, or call our Thalawakale counter at +94 51 222 4190 for custom orders.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={onResetFilters}
                className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-md transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          </div>
        ) : (
          <div
            data-testid="catalog-grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {products.map((product) => {
              const cartQty = cartQtyByProduct[product.id] ?? 0;
              const justAddedCart = recentlyAddedId === product.id;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col justify-between bg-white border border-zinc-200 rounded-xl overflow-hidden transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div>
                    {/* Studio Product Frame */}
                    <button
                      type="button"
                      onClick={() => onInspectProduct(product)}
                      aria-label={`Inspect technical specs for ${product.name}`}
                      className="w-full aspect-[4/3] bg-[#e3e3e3] p-2 flex items-center justify-center relative overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-amber-500"
                    >
                      <ProductImage
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-[1.04]"
                        fallbackLabel={product.shortName}
                      />
                    </button>

                    {/* Card Details */}
                    <div className="p-4 pb-3">
                      <div className="flex items-center justify-between gap-2 text-[11px] font-mono text-zinc-500 mb-1.5">
                        <span>{product.sku}</span>
                        <span>{product.categoryLabel}</span>
                      </div>

                      <h3 className="font-semibold text-base text-zinc-950 leading-snug mb-2 min-h-[2.75rem]">
                        <button
                          type="button"
                          onClick={() => onInspectProduct(product)}
                          className="text-left hover:underline underline-offset-2 cursor-pointer"
                        >
                          {product.name}
                        </button>
                      </h3>

                      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 mb-2">
                        <span className="font-mono tabular-nums text-base font-bold text-zinc-950 whitespace-nowrap">
                          {formatCurrency(product.price)}
                        </span>
                        {product.compareAtPrice && (
                          <span className="font-mono tabular-nums text-xs text-zinc-400 line-through whitespace-nowrap">
                            {formatCurrency(product.compareAtPrice)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2 text-[11px] text-zinc-500">
                        <span className="truncate">{product.compliance}</span>
                        <button
                          type="button"
                          onClick={() => onInspectProduct(product)}
                          className="font-semibold text-zinc-800 hover:text-amber-600 underline underline-offset-2 shrink-0 cursor-pointer"
                        >
                          View Specs
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Row */}
                  <div className="p-4 pt-2 flex items-center gap-2 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => {
                        onAddToCart(product);
                        setRecentlyAddedId(product.id);
                      }}
                      aria-label={`Add ${product.shortName} to cart`}
                      className={`flex-1 py-2 px-3 text-xs font-semibold rounded-md transition-colors whitespace-nowrap inline-flex items-center justify-center gap-1 cursor-pointer ${
                        justAddedCart
                          ? 'bg-emerald-700 text-white'
                          : 'bg-zinc-950 hover:bg-amber-400 hover:text-zinc-950 text-white'
                      }`}
                    >
                      {justAddedCart ? (
                        <>
                          <Check className="w-3.5 h-3.5 shrink-0" />
                          <span>Added to Cart</span>
                        </>
                      ) : cartQty > 0 ? (
                        <span>Add to Cart ({cartQty})</span>
                      ) : (
                        <span>Add to Cart</span>
                      )}
                    </button>
                  </div>
                </article>
              );
            })}

            {/* 8th Grid Slot: Thalawakale Showroom & Trade Counter Card */}
            {showStoreDeskCard && (
              <article className="flex flex-col justify-between bg-zinc-950 text-white rounded-xl p-6 border border-zinc-800">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
                    <Store className="w-5 h-5 text-amber-400" />
                  </div>
                  <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
                    Thalawakale Counter · 22100
                  </p>
                  <h3 className="font-display font-bold text-xl leading-snug text-white mb-3">
                    No. 42, Main Street Showroom &amp; Trade Desk
                  </h3>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    Visit our counter Mon–Sat 07:30–19:00 for same-day pickup, full 90m cable coils, MCB/RCCB breakers, PVC conduits, or estate bulk supply inquiries (+94 51 222 4190).
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={onJumpToTradeSupply}
                    className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-semibold rounded-md inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <span>Trade &amp; Delivery Info</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </article>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
