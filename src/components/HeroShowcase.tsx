import { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Cable,
  Cpu,
  Gauge,
  Hammer,
  Lightbulb,
  Wrench,
} from 'lucide-react';
import { CATEGORIES } from '../data/catalog';
import { CategoryId, Product } from '../types/store';
import { formatCurrency } from '../utils/pricing';
import { ProductImage } from './ProductImage';

interface HeroShowcaseProps {
  featuredProducts: Product[];
  selectedCategory: CategoryId;
  onSelectCategory: (categoryId: CategoryId) => void;
  onAddToCart: (product: Product) => void;
  onInspectProduct: (product: Product) => void;
  onScrollToCatalog: () => void;
}

const CATEGORY_ICONS: Record<Exclude<CategoryId, 'all'>, typeof Hammer> = {
  'power-tools': Hammer,
  'circuit-panels': Cpu,
  'wiring-conduit': Cable,
  'testing-meters': Gauge,
  'lighting-led': Lightbulb,
  'hand-tools': Wrench,
};

export function HeroShowcase({
  featuredProducts,
  selectedCategory,
  onSelectCategory,
  onAddToCart,
  onInspectProduct,
  onScrollToCatalog,
}: HeroShowcaseProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const current = featuredProducts[activeIndex] ?? featuredProducts[0];

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + featuredProducts.length) % featuredProducts.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % featuredProducts.length);
  };

  const savings = current.compareAtPrice
    ? Math.round(current.compareAtPrice - current.price)
    : 0;

  return (
    <section id="top" className="bg-white pt-5 pb-8 lg:pt-7 lg:pb-10 border-b border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Bold Centered Display Headline matching reference template */}
        <div className="text-center mb-4 lg:mb-6">
          <p className="text-xs font-mono uppercase tracking-[0.22em] text-zinc-500 mb-1.5">
            Thalawakale · Nuwara Eliya · Island-Wide Hardware &amp; Electrical Supply
          </p>
          <h1 className="font-display font-extrabold tracking-tight text-zinc-950 text-3xl sm:text-5xl lg:text-[54px] leading-[1.02] text-balance">
            {current.heroHeadline || 'POWER & HARDWARE'}
          </h1>
        </div>

        {/* 3-Column Master Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Wing: Title, Price & Primary Cart Action */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col items-start">
            <span className="text-xs font-mono text-zinc-500 mb-1.5">
              {current.sku} · {current.categoryLabel}
            </span>
            <h2 className="font-display font-bold text-2xl text-zinc-950 leading-snug mb-3 text-balance">
              {current.name}
            </h2>

            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1 mb-2">
              <span className="font-mono tabular-nums text-2xl font-bold text-zinc-950 whitespace-nowrap">
                {formatCurrency(current.price)}
              </span>
              {current.compareAtPrice && (
                <span className="font-mono tabular-nums text-sm text-zinc-400 line-through whitespace-nowrap">
                  {formatCurrency(current.compareAtPrice)}
                </span>
              )}
            </div>

            {savings > 0 && (
              <p className="text-xs font-medium text-zinc-700 mb-5">
                Save {formatCurrency(savings)} · Incl. 18% VAT · {current.compliance}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-2.5 w-full">
              <button
                type="button"
                onClick={() => onAddToCart(current)}
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-950"
              >
                Add to Cart
              </button>
              <button
                type="button"
                onClick={onScrollToCatalog}
                className="px-4 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 border border-zinc-300 text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                Browse Catalog
              </button>
            </div>
          </div>

          {/* Center Wing: 2K Master Studio Showcase */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center">
            <div className="w-full max-w-[390px] aspect-square bg-[#e3e3e3] rounded-xl p-2 flex items-center justify-center relative overflow-hidden">
              <ProductImage
                src={current.image}
                alt={current.name}
                className="w-full h-full object-contain transition-transform duration-300 hover:scale-[1.03]"
                fallbackLabel={current.shortName}
              />
            </div>

            {/* Showcase Switcher Arrows */}
            <div className="flex items-center gap-4 mt-4">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous featured hardware"
                className="w-9 h-9 rounded-full border border-zinc-300 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white flex items-center justify-center text-zinc-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="font-mono tabular-nums text-xs text-zinc-500">
                0{activeIndex + 1} / 0{featuredProducts.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next featured hardware"
                className="w-9 h-9 rounded-full border border-zinc-300 hover:border-zinc-950 hover:bg-zinc-950 hover:text-white flex items-center justify-center text-zinc-800 transition-colors cursor-pointer"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Wing: Technical Specs & Detail Trigger */}
          <div className="lg:col-span-3 order-3 flex flex-col items-start">
            <p className="text-sm text-zinc-600 leading-relaxed mb-4">
              {current.summary}
            </p>

            <dl className="w-full border-t border-zinc-200 divide-y divide-zinc-200 mb-5">
              {current.specs.slice(0, 3).map((spec) => (
                <div
                  key={spec.label}
                  className="py-2 flex items-center justify-between gap-4 text-xs"
                >
                  <dt className="text-zinc-500">{spec.label}</dt>
                  <dd className="font-mono tabular-nums font-semibold text-zinc-900 text-right">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            <button
              type="button"
              onClick={() => onInspectProduct(current)}
              className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 text-white text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              View Full Specs
            </button>
          </div>
        </div>

        {/* Category Explorer Strip matching reference template */}
        <div className="mt-7 pt-6 border-t border-zinc-200 flex items-center gap-3 lg:gap-5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => onSelectCategory('all')}
            className={`w-20 h-20 rounded-full shrink-0 flex flex-col items-center justify-center text-center px-2 transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-zinc-950 text-white'
                : 'bg-zinc-900 hover:bg-zinc-800 text-white'
            }`}
          >
            <span className="text-[11px] font-display font-bold leading-tight">
              Explore
              <br />
              Categories
            </span>
          </button>

          <div className="flex items-center gap-3 sm:gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id];
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id)}
                  className={`group flex flex-col items-center justify-center w-20 h-20 rounded-full shrink-0 px-2 transition-all cursor-pointer border ${
                    isActive
                      ? 'bg-amber-400 border-amber-500 text-zinc-950'
                      : 'bg-zinc-100 hover:bg-zinc-200 border-transparent text-zinc-800'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 mb-1 ${
                      isActive ? 'text-zinc-950' : 'text-zinc-700 group-hover:text-zinc-950'
                    }`}
                    strokeWidth={1.85}
                  />
                  <span className="text-[11px] font-semibold leading-tight text-center">
                    {cat.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
