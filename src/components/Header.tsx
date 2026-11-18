import { useState } from 'react';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  totalBadgeCount: number;
  userLabel: string | null;
  onOpenAccount: () => void;
  onOpenDrawer: () => void;
  onNavigateSection: (sectionId: string) => void;
}

export function Header({
  totalBadgeCount,
  userLabel,
  onOpenAccount,
  onOpenDrawer,
  onNavigateSection,
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId: string) => {
    setMobileMenuOpen(false);
    onNavigateSection(sectionId);
  };

  return (
    <>
      <div className="bg-zinc-950 text-zinc-100 text-xs py-2 px-4 text-center border-b border-zinc-800 no-print">
        <p className="font-medium tracking-wide truncate">
          No. 42, Main St, Thalawakale · Prices incl. 18% VAT · Free delivery over LKR 45,000
        </p>
      </div>

      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-zinc-200 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 md:gap-8">
          {/* Zone 1: Brand Wordmark */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              handleNavClick('top');
            }}
            className="flex items-center gap-2 text-sm sm:text-base lg:text-lg font-display font-extrabold tracking-tight text-zinc-950 whitespace-nowrap min-w-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
          >
            <BrandLogo variant="light" size="md" />
            <span className="truncate">Thalawakale Electrical &amp; Hardware</span>
          </a>

          {/* Zone 2: 5 Single-Line Text Nav Links */}
          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-zinc-600"
          >
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('top');
              }}
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Home
            </a>
            <a
              href="#catalog"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('catalog');
              }}
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Catalog
            </a>
            <a
              href="#contractor-supply"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('contractor-supply');
              }}
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Trade Supply
            </a>
            <a
              href="#store-info"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('store-info');
              }}
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Store Info
            </a>
            <button
              type="button"
              onClick={onOpenAccount}
              className="hover:text-zinc-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 max-w-[130px] truncate cursor-pointer text-zinc-900 font-semibold"
            >
              {userLabel ?? 'Sign In'}
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenDrawer}
              aria-label={`Open order cart, ${totalBadgeCount} items`}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs sm:text-sm font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              <ShoppingBag className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={2} />
              <span className="hidden sm:inline">Order Cart</span>
              <span className="sm:hidden">Cart</span>
              <span className="font-mono tabular-nums text-xs bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded">
                {totalBadgeCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-zinc-200 text-zinc-800 hover:bg-zinc-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile navigation drawer */}
        {mobileMenuOpen && (
          <nav
            aria-label="Mobile navigation"
            className="md:hidden border-t border-zinc-200 bg-white px-4 py-3 flex flex-col gap-1"
          >
            <button
              type="button"
              onClick={() => handleNavClick('top')}
              className="text-left py-2.5 px-3 rounded-md text-sm font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('catalog')}
              className="text-left py-2.5 px-3 rounded-md text-sm font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Catalog
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('contractor-supply')}
              className="text-left py-2.5 px-3 rounded-md text-sm font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Trade Supply
            </button>
            <button
              type="button"
              onClick={() => handleNavClick('store-info')}
              className="text-left py-2.5 px-3 rounded-md text-sm font-medium text-zinc-800 hover:bg-zinc-100"
            >
              Store Info
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAccount();
              }}
              className="text-left py-2.5 px-3 rounded-md text-sm font-semibold text-zinc-950 bg-amber-50 hover:bg-amber-100 mt-1"
            >
              {userLabel ? `Account (${userLabel})` : 'Sign In / Trade Account'}
            </button>
          </nav>
        )}
      </header>
    </>
  );
}
