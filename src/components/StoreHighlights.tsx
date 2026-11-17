import { useState, type MouseEvent } from 'react';
import { ArrowRight, Clock, ShieldCheck, Truck } from 'lucide-react';
import { motion, MotionConfig, useReducedMotion } from 'motion/react';

interface StoreHighlightsProps {
  onJumpToCatalog: () => void;
  onOpenAccount: () => void;
}

const EASE_OUT_EXPO: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function StoreHighlights({
  onJumpToCatalog,
  onOpenAccount,
}: StoreHighlightsProps) {
  const prefersReducedMotion = useReducedMotion();
  const [activeCardIndex, setActiveCardIndex] = useState<number | null>(null);
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number }>({
    x: 180,
    y: 120,
  });

  const pillars = [
    {
      index: '01.',
      icon: Clock,
      title: 'Same-Day Thalawakale Pickup',
      description:
        'Order online and collect directly from our No. 42, Main Street, Thalawakale counter within 2 hours during shop hours at zero delivery charge.',
      assuranceNote: '2-Hour Counter Ready · LKR 0 Fee',
      actionLabel: 'Browse Ready Stock',
      onAction: onJumpToCatalog,
    },
    {
      index: '02.',
      icon: Truck,
      title: 'Up-Country & Island-Wide Delivery',
      description:
        'Same-day van dispatch across Thalawakale, Hatton, Kotagala & Nuwara Eliya, plus island-wide courier — free on orders over LKR 45,000.',
      assuranceNote: 'Free Dispatch Over LKR 45,000',
      actionLabel: 'Save Delivery Details',
      onAction: onOpenAccount,
    },
    {
      index: '03.',
      icon: ShieldCheck,
      title: 'SLS & Electrical Standard Stock',
      description:
        'From SLS 733 copper cables, BS EN 60898 switchgear & 230V 50Hz tools to SLS 147 uPVC fittings, water pumps, 304 brass locks & exterior paints.',
      assuranceNote: 'SLS 733 · SLS 147 · BS EN 60898',
      actionLabel: 'Inspect Product Specs',
      onAction: onJumpToCatalog,
    },
  ];

  const handleCardMouseMove = (
    idx: number,
    e: MouseEvent<HTMLElement>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setActiveCardIndex(idx);
    setSpotlightPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <MotionConfig reducedMotion="user">
      <section
        id="store-info"
        className="py-12 lg:py-16 bg-white border-t border-zinc-200 no-print overflow-hidden"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
            className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
          >
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
                Store &amp; Supply Assurance
              </p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight text-balance">
                Built for Electricians, Estates &amp; Homeowners
              </h2>
            </div>
            <p className="text-xs font-mono text-zinc-500 whitespace-nowrap">
              Mon–Sat · 07:30–19:00 · +94 51 222 4190
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {pillars.map((pillar, idx) => {
              const Icon = pillar.icon;
              const isHighlighted = activeCardIndex === idx;

              return (
                <motion.article
                  key={pillar.title}
                  initial={prefersReducedMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.48,
                    delay: prefersReducedMotion ? 0 : idx * 0.09,
                    ease: EASE_OUT_EXPO,
                  }}
                  whileHover={prefersReducedMotion ? undefined : { y: -4 }}
                  onMouseMove={(e) => handleCardMouseMove(idx, e)}
                  onMouseEnter={() => setActiveCardIndex(idx)}
                  onMouseLeave={() => setActiveCardIndex(null)}
                  onFocus={() => setActiveCardIndex(idx)}
                  onBlur={() => setActiveCardIndex(null)}
                  className="group relative p-6 bg-zinc-50 hover:bg-white border border-zinc-200 hover:border-zinc-900 rounded-xl flex flex-col justify-between transition-[background-color,border-color,box-shadow] duration-300 hover:shadow-xl hover:shadow-zinc-950/[0.06] overflow-hidden"
                >
                  {/* Cursor-tracking warm amber spotlight */}
                  {!prefersReducedMotion && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                      style={{
                        opacity: isHighlighted ? 1 : 0,
                        background: `radial-gradient(360px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(251, 191, 36, 0.14), transparent 65%)`,
                      }}
                    />
                  )}

                  {/* Top precision amber sweep bar */}
                  <div
                    aria-hidden="true"
                    className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-amber-400 origin-left transition-transform duration-300 ease-out ${
                      isHighlighted ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                      <span
                        className={`font-mono text-xs font-semibold tabular-nums transition-colors duration-300 ${
                          isHighlighted
                            ? 'text-amber-600'
                            : 'text-zinc-500 group-hover:text-amber-600'
                        }`}
                      >
                        {pillar.index}
                      </span>

                      <motion.div
                        animate={
                          !prefersReducedMotion && isHighlighted
                            ? { scale: 1.06, rotate: idx === 1 ? 2 : -3 }
                            : { scale: 1, rotate: 0 }
                        }
                        transition={{ type: 'spring', stiffness: 360, damping: 22 }}
                        className="w-10 h-10 rounded-lg bg-white border border-zinc-200 group-hover:bg-zinc-950 group-hover:border-zinc-950 flex items-center justify-center transition-colors duration-300"
                      >
                        <Icon
                          className="w-5 h-5 text-zinc-900 group-hover:text-amber-400 transition-colors duration-300"
                          strokeWidth={1.85}
                        />
                      </motion.div>
                    </div>

                    <h3 className="font-display font-bold text-lg text-zinc-950 mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-sm text-zinc-600 leading-relaxed mb-5">
                      {pillar.description}
                    </p>
                  </div>

                  <div className="relative z-10 pt-4 border-t border-zinc-200/80 flex flex-col gap-3">
                    <p className="font-mono text-[11px] font-medium text-zinc-500 tabular-nums">
                      {pillar.assuranceNote}
                    </p>
                    <button
                      type="button"
                      onClick={pillar.onAction}
                      className="group/cta inline-flex items-center gap-1.5 text-left text-xs font-semibold text-zinc-950 hover:text-amber-700 transition-colors cursor-pointer self-start focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-500"
                    >
                      <span className="underline underline-offset-4">
                        {pillar.actionLabel}
                      </span>
                      <ArrowRight
                        className="w-3.5 h-3.5 transition-transform duration-200 group-hover/cta:translate-x-1"
                        strokeWidth={2}
                      />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
