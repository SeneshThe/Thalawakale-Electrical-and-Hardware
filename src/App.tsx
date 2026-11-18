/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useMemo, useState } from 'react';
import { Scale, X } from 'lucide-react';
import { AccountModal } from './components/AccountModal';
import { CatalogSection, SortOption } from './components/CatalogSection';
import { CartQuoteDrawer } from './components/CartQuoteDrawer';
import { CompareModal } from './components/CompareModal';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroShowcase } from './components/HeroShowcase';
import { MarqueeStrip } from './components/MarqueeStrip';
import { ProductDetailModal } from './components/ProductDetailModal';
import { PromoBanner } from './components/PromoBanner';
import { SiteCalculatorModal } from './components/SiteCalculatorModal';
import { StoreHighlights } from './components/StoreHighlights';
import { useAuth } from './contexts/AuthContext';
import { PRODUCTS } from './data/catalog';
import {
  CartItem,
  CategoryId,
  Product,
  ProductVariant,
} from './types/store';

const CART_STORAGE_KEY = 'thalawakale_cart_v1';
const SAVED_STORAGE_KEY = 'thalawakale_saved_v1';

function readStoredJson<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

export default function App() {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('featured');

  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    readStoredJson<CartItem[]>(CART_STORAGE_KEY, [])
  );
  const [savedIds, setSavedIds] = useState<string[]>(() =>
    readStoredJson<string[]>(SAVED_STORAGE_KEY, [])
  );
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch {
      // Ignore storage quota issues
    }
  }, [cartItems]);

  useEffect(() => {
    try {
      window.localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(savedIds));
    } catch {
      // Ignore storage quota issues
    }
  }, [savedIds]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  const featuredProducts = useMemo(
    () => PRODUCTS.filter((p) => p.heroFeatured),
    []
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const filtered = PRODUCTS.filter((product) => {
      if (showSavedOnly && !savedIds.includes(product.id)) return false;
      const matchesCat =
        selectedCategory === 'all' || product.category === selectedCategory;
      if (!matchesCat) return false;
      if (!q) return true;
      const haystack = [
        product.name,
        product.sku,
        product.categoryLabel,
        product.summary,
        product.compliance,
        ...product.specs.map((s) => `${s.label} ${s.value}`),
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });

    if (sortBy === 'price-asc') {
      return [...filtered].sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'price-desc') {
      return [...filtered].sort((a, b) => b.price - a.price);
    }
    return filtered;
  }, [selectedCategory, searchQuery, sortBy, showSavedOnly, savedIds]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectCategoryAndScroll = (categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    scrollToSection('catalog');
  };

  const handleAddToCart = (
    product: Product,
    variant: ProductVariant = product.variants[0],
    quantity = 1
  ) => {
    const unitPrice = Math.max(1, product.price + (variant?.priceDelta ?? 0));
    const sku = `${product.sku}-${variant?.skuSuffix ?? 'STD'}`;
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.productId === product.id && item.variantId === variant.id
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id && item.variantId === variant.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          variantId: variant.id,
          sku,
          name: product.name,
          variantLabel: variant.label,
          unitPrice,
          quantity,
          image: product.image,
        },
      ];
    });
    setToastMessage(`Added ${quantity} × ${product.shortName} to Order Cart`);
  };

  const handleUpdateCartQty = (productId: string, variantId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId && item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleRemoveCartItem = (productId: string, variantId: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.variantId === variantId)
      )
    );
  };

  const handleToggleSaved = (product: Product) => {
    const alreadySaved = savedIds.includes(product.id);
    setSavedIds((prev) =>
      alreadySaved ? prev.filter((id) => id !== product.id) : [...prev, product.id]
    );
    setToastMessage(
      alreadySaved
        ? `Removed ${product.shortName} from Saved`
        : `Saved ${product.shortName} for later`
    );
  };

  const handleToggleCompare = (product: Product) => {
    const exists = compareIds.includes(product.id);
    if (exists) {
      setCompareIds((prev) => prev.filter((id) => id !== product.id));
      return;
    }
    if (compareIds.length >= 3) {
      setToastMessage('Compare supports up to 3 items at a time');
      return;
    }
    setCompareIds((prev) => [...prev, product.id]);
  };

  const savedProducts = useMemo(
    () => PRODUCTS.filter((p) => savedIds.includes(p.id)),
    [savedIds]
  );

  const compareProducts = useMemo(
    () => PRODUCTS.filter((p) => compareIds.includes(p.id)),
    [compareIds]
  );

  const cartQtyByProduct = useMemo(() => {
    const counts: Record<string, number> = {};
    cartItems.forEach((item) => {
      counts[item.productId] = (counts[item.productId] ?? 0) + item.quantity;
    });
    return counts;
  }, [cartItems]);

  const totalBadgeCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const userLabel = user
    ? profile?.displayName?.split(' ')[0] || user.displayName?.split(' ')[0] || 'Account'
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900">
      <Header
        totalBadgeCount={totalBadgeCount}
        userLabel={userLabel}
        onOpenDrawer={() => setDrawerOpen(true)}
        onOpenAccount={() => setAccountModalOpen(true)}
        onNavigateSection={scrollToSection}
      />

      <main className="flex-1">
        <HeroShowcase
          featuredProducts={featuredProducts}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategoryAndScroll}
          onAddToCart={(p) => handleAddToCart(p)}
          onInspectProduct={setInspectedProduct}
          onScrollToCatalog={() => scrollToSection('catalog')}
        />

        <MarqueeStrip />

        <CatalogSection
          products={filteredProducts}
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
          sortBy={sortBy}
          cartQtyByProduct={cartQtyByProduct}
          savedIds={savedIds}
          compareIds={compareIds}
          showSavedOnly={showSavedOnly}
          onSelectCategory={(cat) => {
            setShowSavedOnly(false);
            setSelectedCategory(cat);
          }}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onToggleShowSavedOnly={() => setShowSavedOnly((prev) => !prev)}
          onToggleSaved={handleToggleSaved}
          onToggleCompare={handleToggleCompare}
          onOpenCalculators={() => setCalculatorOpen(true)}
          onResetFilters={() => {
            setSelectedCategory('all');
            setShowSavedOnly(false);
            setSearchQuery('');
            setSortBy('featured');
          }}
          onAddToCart={(p) => handleAddToCart(p)}
          onInspectProduct={setInspectedProduct}
          onJumpToTradeSupply={() => scrollToSection('contractor-supply')}
        />

        <PromoBanner onSelectCategory={handleSelectCategoryAndScroll} />

        <StoreHighlights
          onJumpToCatalog={() => scrollToSection('catalog')}
          onOpenAccount={() => setAccountModalOpen(true)}
        />
      </main>

      <Footer
        onSelectCategory={handleSelectCategoryAndScroll}
        onNavigateSection={scrollToSection}
      />

      <ProductDetailModal
        product={inspectedProduct}
        isSaved={inspectedProduct ? savedIds.includes(inspectedProduct.id) : false}
        onToggleSaved={handleToggleSaved}
        onClose={() => setInspectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartQuoteDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        cartItems={cartItems}
        savedProducts={savedProducts}
        onMoveSavedToCart={(product) => handleAddToCart(product)}
        onRemoveSaved={(id) => setSavedIds((prev) => prev.filter((s) => s !== id))}
        onUpdateCartQty={handleUpdateCartQty}
        onRemoveCartItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        onOpenAccount={() => {
          setDrawerOpen(false);
          setAccountModalOpen(true);
        }}
      />

      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
      />

      <SiteCalculatorModal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        onJumpToCategory={handleSelectCategoryAndScroll}
      />

      <CompareModal
        isOpen={compareOpen}
        products={compareProducts}
        onClose={() => setCompareOpen(false)}
        onRemoveProduct={(id) =>
          setCompareIds((prev) => prev.filter((itemId) => itemId !== id))
        }
        onAddToCart={(p) => handleAddToCart(p)}
      />

      {/* Floating Spec Comparison Dock */}
      {compareProducts.length > 0 && !compareOpen && (
        <div className="fixed bottom-5 left-5 z-40 bg-zinc-950 text-white px-4 py-2.5 rounded-lg shadow-xl border border-zinc-800 flex items-center gap-3 text-xs font-medium no-print">
          <Scale className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="whitespace-nowrap">
            {compareProducts.length} item{compareProducts.length === 1 ? '' : 's'} selected
          </span>
          <button
            type="button"
            onClick={() => setCompareOpen(true)}
            className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold rounded cursor-pointer whitespace-nowrap"
          >
            Compare Specs
          </button>
          <button
            type="button"
            onClick={() => setCompareIds([])}
            aria-label="Clear compare selection"
            className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Live Action Feedback Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 bg-zinc-950 text-white px-4 py-3 rounded-lg shadow-lg border border-zinc-800 flex items-center gap-3 text-xs font-medium no-print"
        >
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setToastMessage(null);
              setDrawerOpen(true);
            }}
            className="text-amber-400 hover:text-amber-300 font-semibold underline cursor-pointer"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}
