import { Clock, ShieldCheck, Truck } from 'lucide-react';

interface StoreHighlightsProps {
  onJumpToCatalog: () => void;
  onOpenAccount: () => void;
}

export function StoreHighlights({
  onJumpToCatalog,
  onOpenAccount,
}: StoreHighlightsProps) {
  const pillars = [
    {
      index: '01.',
      icon: Clock,
      title: 'Same-Day Thalawakale Pickup',
      description:
        'Order online and collect directly from our No. 42, Main Street, Thalawakale counter within 2 hours during shop hours at zero delivery charge.',
      actionLabel: 'Browse Ready Stock',
      onAction: onJumpToCatalog,
    },
    {
      index: '02.',
      icon: Truck,
      title: 'Up-Country & Island-Wide Delivery',
      description:
        'Same-day van dispatch across Thalawakale, Hatton, Kotagala & Nuwara Eliya, plus island-wide courier — free on orders over LKR 45,000.',
      actionLabel: 'Save Delivery Details',
      onAction: onOpenAccount,
    },
    {
      index: '03.',
      icon: ShieldCheck,
      title: 'Sri Lankan Electrical Compliance',
      description:
        'Every DB enclosure, SLS 733 copper cable coil, VDE 1000V hand tool, and 230V 50Hz Type-G power tool meets PUCSL, SLS, BS EN 60898, and IEC benchmarks.',
      actionLabel: 'Inspect Product Specs',
      onAction: onJumpToCatalog,
    },
  ];

  return (
    <section id="store-info" className="py-12 lg:py-14 bg-white border-t border-zinc-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-wider text-zinc-500 mb-1.5">
              Store &amp; Supply Assurance
            </p>
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-zinc-950 tracking-tight">
              Built for Electricians, Estates &amp; Homeowners
            </h2>
          </div>
          <p className="text-xs font-mono text-zinc-500">
            Mon–Sat · 07:30–19:00 · +94 51 222 4190
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="p-6 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono text-xs font-semibold text-zinc-500">
                      {pillar.index}
                    </span>
                    <Icon className="w-5 h-5 text-zinc-900" strokeWidth={1.85} />
                  </div>
                  <h3 className="font-display font-bold text-lg text-zinc-950 mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-zinc-600 leading-relaxed mb-5">
                    {pillar.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={pillar.onAction}
                  className="text-left text-xs font-semibold text-zinc-950 hover:text-amber-600 underline underline-offset-4 transition-colors cursor-pointer self-start"
                >
                  {pillar.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
