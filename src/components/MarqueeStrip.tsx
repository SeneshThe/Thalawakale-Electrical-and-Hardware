export function MarqueeStrip() {
  const highlights = [
    'Free delivery over LKR 45,000',
    'SLS 733 Copper · SLS 147 uPVC · BS EN 60898',
    '230V/400V 50Hz · Pumps, Locks & Paints',
    'Same-day Thalawakale pickup & dispatch',
  ];

  return (
    <div className="bg-zinc-950 text-zinc-200 py-3 border-b border-zinc-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-center lg:justify-between gap-x-5 gap-y-2 text-xs font-medium">
        {highlights.map((item, idx) => (
          <div key={item} className="flex items-center gap-5">
            <span className="whitespace-nowrap">{item}</span>
            {idx < highlights.length - 1 && (
              <span aria-hidden="true" className="hidden lg:inline text-amber-400">
                /
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
