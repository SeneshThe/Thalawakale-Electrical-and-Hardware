import { ArrowRight } from 'lucide-react';
import { PROMO_BANNER_IMAGE } from '../data/catalog';
import { CategoryId } from '../types/store';
import { ProductImage } from './ProductImage';

interface PromoBannerProps {
  onSelectCategory: (categoryId: CategoryId) => void;
}

export function PromoBanner({ onSelectCategory }: PromoBannerProps) {
  return (
    <section id="contractor-supply" className="py-6 lg:py-10 bg-white no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden bg-zinc-950 min-h-[340px] lg:min-h-[380px] flex items-center">
          {/* Background 2K Dark Editorial Photo */}
          <div className="absolute inset-0">
            <ProductImage
              src={PROMO_BANNER_IMAGE}
              alt="Precision electrical hand tools, brass conduit fittings, and multimeter on charcoal slate workbench"
              className="w-full h-full object-cover object-center"
              fallbackLabel="Contractor Hand Tools & Electrical Supply"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/30"
            />
          </div>

          {/* Foreground Copy */}
          <div className="relative z-10 max-w-lg p-8 sm:p-12 lg:p-14 text-white">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400 mb-3">
              Trade &amp; Estate Supply
            </p>
            <h2 className="font-display font-extrabold text-3xl sm:text-4xl leading-tight mb-3 text-balance">
              Electrical &amp; Hardware for Island-Wide Sites
            </h2>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed mb-7">
              Thalawakale counter stock across tools, SLS cables, DBs, uPVC plumbing, pumps &amp; paint.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onSelectCategory('wiring-conduit')}
                className="px-5 py-2.5 bg-white hover:bg-amber-400 text-zinc-950 text-sm font-semibold rounded-md inline-flex items-center gap-2 transition-colors cursor-pointer"
              >
                <span>Shop Cables &amp; Switchgear</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onSelectCategory('plumbing-pvc')}
                className="px-5 py-2.5 bg-zinc-900/80 hover:bg-zinc-800 text-white border border-zinc-700 text-sm font-semibold rounded-md transition-colors cursor-pointer"
              >
                Browse Plumbing &amp; Pumps
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
