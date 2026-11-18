import { useEffect, useState } from 'react';
import { ArrowRight, Calculator, Paintbrush, X, Zap } from 'lucide-react';
import { CategoryId } from '../types/store';
import {
  calculateCircuitSizing,
  calculatePaintRequirement,
  SupplyPhase,
} from '../utils/calculators';

interface SiteCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJumpToCategory: (category: CategoryId) => void;
}

export function SiteCalculatorModal({
  isOpen,
  onClose,
  onJumpToCategory,
}: SiteCalculatorModalProps) {
  const [activeTab, setActiveTab] = useState<'electrical' | 'paint'>('electrical');

  // Electrical Circuit Calculator State
  const [watts, setWatts] = useState<number>(3500);
  const [phase, setPhase] = useState<SupplyPhase>('single-230v');
  const [distanceMeters, setDistanceMeters] = useState<number>(20);

  // Exterior Paint Calculator State
  const [wallAreaSqm, setWallAreaSqm] = useState<number>(110);
  const [coats, setCoats] = useState<number>(2);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const circuitResult = calculateCircuitSizing({
    watts: Number.isFinite(watts) ? watts : 1000,
    phase,
    distanceMeters: Number.isFinite(distanceMeters) ? distanceMeters : 15,
  });

  const paintResult = calculatePaintRequirement({
    areaSqm: Number.isFinite(wallAreaSqm) ? wallAreaSqm : 50,
    coats,
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="site-calc-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-xl w-full overflow-hidden shadow-2xl border border-zinc-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-950 text-amber-400 flex items-center justify-center shrink-0">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="site-calc-title"
                className="font-display font-bold text-base text-zinc-950 leading-tight"
              >
                Site Sizing Calculators
              </h2>
              <p className="text-[11px] text-zinc-500">
                Quick reference for SLS 733 wiring &amp; exterior paint coverage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close site calculators"
            className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="px-6 pt-3 border-b border-zinc-200 flex items-center gap-2 bg-zinc-50">
          <button
            type="button"
            onClick={() => setActiveTab('electrical')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'electrical'
                ? 'border-zinc-950 text-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Cable &amp; MCB Sizer</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paint')}
            className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'paint'
                ? 'border-zinc-950 text-zinc-950'
                : 'border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5" />
            <span>Paint Coverage</span>
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'electrical' ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="calc-watts"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Connected Load (Watts)
                  </label>
                  <input
                    id="calc-watts"
                    type="number"
                    min={100}
                    max={50000}
                    step={100}
                    value={watts}
                    onChange={(e) => setWatts(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md font-mono tabular-nums focus:bg-white focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calc-phase"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Supply System
                  </label>
                  <select
                    id="calc-phase"
                    value={phase}
                    onChange={(e) => setPhase(e.target.value as SupplyPhase)}
                    className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                  >
                    <option value="single-230v">230V Single-Phase</option>
                    <option value="three-400v">400V Three-Phase</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="calc-distance"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Cable Run (Metres)
                  </label>
                  <input
                    id="calc-distance"
                    type="number"
                    min={1}
                    max={250}
                    value={distanceMeters}
                    onChange={(e) => setDistanceMeters(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md font-mono tabular-nums focus:bg-white focus:outline-none focus:border-zinc-950"
                  />
                </div>
              </div>

              <div className="p-4 bg-zinc-950 text-white rounded-xl grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-mono text-zinc-400">Design Load</p>
                  <p className="font-mono tabular-nums text-xl font-bold text-white mt-0.5">
                    {circuitResult.currentAmps} A
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-mono text-zinc-400">MCB Breaker</p>
                  <p className="font-mono tabular-nums text-xl font-bold text-amber-400 mt-0.5">
                    {circuitResult.recommendedMcbAmps} A
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-mono text-zinc-400">SLS 733 Cable</p>
                  <p className="font-mono tabular-nums text-xl font-bold text-white mt-0.5">
                    {circuitResult.recommendedCableMm2}
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-600">{circuitResult.cableNote}</p>

              <div className="pt-2 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onJumpToCategory('wiring-conduit');
                    onClose();
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Shop SLS 733 Copper Cables</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onJumpToCategory('circuit-panels');
                    onClose();
                  }}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-md cursor-pointer"
                >
                  Browse DBs &amp; Switchgear
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="calc-area"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Total Wall Area (m²)
                  </label>
                  <input
                    id="calc-area"
                    type="number"
                    min={5}
                    max={5000}
                    value={wallAreaSqm}
                    onChange={(e) => setWallAreaSqm(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md font-mono tabular-nums focus:bg-white focus:outline-none focus:border-zinc-950"
                  />
                </div>

                <div>
                  <label
                    htmlFor="calc-coats"
                    className="block text-xs font-semibold text-zinc-700 mb-1"
                  >
                    Number of Coats
                  </label>
                  <select
                    id="calc-coats"
                    value={coats}
                    onChange={(e) => setCoats(Number(e.target.value))}
                    className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                  >
                    <option value={1}>1 Coat (Refresh)</option>
                    <option value={2}>2 Coats (Standard Finish)</option>
                    <option value={3}>3 Coats (New Masonry)</option>
                  </select>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 text-white rounded-xl grid grid-cols-3 gap-4">
                <div>
                  <p className="text-[11px] font-mono text-zinc-400">Litres Needed</p>
                  <p className="font-mono tabular-nums text-xl font-bold text-white mt-0.5">
                    {paintResult.litresNeeded} L
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-mono text-zinc-400">10L Drums</p>
                  <p className="font-mono tabular-nums text-xl font-bold text-amber-400 mt-0.5">
                    {paintResult.drums10L}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-mono text-zinc-400">4L Buckets</p>
                  <p className="font-mono tabular-nums text-xl font-bold text-white mt-0.5">
                    {paintResult.buckets4L}
                  </p>
                </div>
              </div>

              <p className="text-xs text-zinc-600">
                Estimated at 12 m²/L per coat for Weather-Shield exterior emulsion ({paintResult.totalAreaSqm} m² total coverage).
              </p>

              <div className="pt-2 border-t border-zinc-200 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onJumpToCategory('building-hardware');
                    onClose();
                  }}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Shop Exterior Paint &amp; Building</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
