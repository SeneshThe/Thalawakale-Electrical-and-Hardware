import { CATEGORIES } from '../data/catalog';
import { CategoryId } from '../types/store';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  onSelectCategory: (cat: CategoryId) => void;
  onNavigateSection: (sectionId: string) => void;
}

export function Footer({ onSelectCategory, onNavigateSection }: FooterProps) {
  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10">
          <div className="md:col-span-5">
            <div className="flex items-center gap-2.5 text-white font-display font-extrabold text-lg sm:text-xl tracking-tight mb-3">
              <BrandLogo variant="dark" size="md" />
              <span>Thalawakale Electrical &amp; Hardware</span>
            </div>
            <div className="text-xs text-zinc-400 space-y-1 font-mono">
              <p>No. 42, Main Street, Thalawakale 22100</p>
              <p>+94 51 222 4190 · Mon–Sat 07:30–19:00</p>
            </div>
          </div>

          <div className="md:col-span-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
              Catalog Departments
            </h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => onSelectCategory(cat.id)}
                    className="text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer text-left"
                  >
                    {cat.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
              Store Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('catalog')}
                  className="text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Online Hardware Catalog
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('contractor-supply')}
                  className="text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Estate &amp; Trade Supply
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onNavigateSection('store-info')}
                  className="text-zinc-300 hover:text-amber-400 transition-colors cursor-pointer"
                >
                  Counter Pickup &amp; Dispatch
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-500">
          <p>© 2026 Thalawakale Electrical &amp; Hardware</p>
          <p className="font-mono">LankaQR · Visa / Mastercard · COD · Counter Pickup</p>
        </div>
      </div>
    </footer>
  );
}
