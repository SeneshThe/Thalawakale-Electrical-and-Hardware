import { useEffect, useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  LogOut,
  Package,
  User as UserIcon,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserAccountType } from '../types/store';
import { formatCurrency } from '../utils/pricing';
import { BrandLogo } from './BrandLogo';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AccountModal({ isOpen, onClose }: AccountModalProps) {
  const {
    user,
    profile,
    orders,
    authLoading,
    authError,
    clearAuthError,
    signInWithGoogle,
    signOutUser,
    updateUserProfile,
  } = useAuth();

  const [selectedType, setSelectedType] = useState<UserAccountType>('retail');
  const [activeTab, setActiveTab] = useState<'profile' | 'orders'>('profile');

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [profileAccountType, setProfileAccountType] = useState<UserAccountType>('retail');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName);
      setPhone(profile.phone);
      setCompanyName(profile.companyName);
      setAddress(profile.address);
      setPostalCode(profile.postalCode || '22100');
      setProfileAccountType(profile.accountType);
    }
  }, [profile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!savedNotice) return;
    const t = window.setTimeout(() => setSavedNotice(false), 2400);
    return () => window.clearTimeout(t);
  }, [savedNotice]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    setSavingProfile(true);
    try {
      await updateUserProfile({
        accountType: profileAccountType,
        displayName,
        phone,
        companyName,
        address,
        postalCode,
      });
      setSavedNotice(true);
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs p-4 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-zinc-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BrandLogo variant="light" size="sm" />
            <div>
              <h2
                id="account-modal-title"
                className="font-display font-bold text-base text-zinc-950 leading-tight"
              >
                {user ? 'Customer & Trade Account' : 'Sign In to Thalawakale Hardware'}
              </h2>
              <p className="text-xs text-zinc-500">
                {user ? user.email : 'Save delivery defaults, pickup preferences, and order history'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close account modal"
            className="w-9 h-9 rounded-md flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {!user ? (
          <div className="p-6 sm:p-8 space-y-6">
            <div>
              <p className="text-xs font-semibold text-zinc-800 mb-3">
                1. Choose Your Account Type
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType('retail');
                    clearAuthError();
                  }}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    selectedType === 'retail'
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-50 text-zinc-900 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                    <UserIcon
                      className={`w-4 h-4 ${
                        selectedType === 'retail' ? 'text-amber-400' : 'text-zinc-700'
                      }`}
                    />
                    <span>Retail &amp; Homeowner</span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      selectedType === 'retail' ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    Fast checkout, Thalawakale counter pickup tracking, and saved hardware orders.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedType('contractor');
                    clearAuthError();
                  }}
                  className={`p-4 rounded-xl border text-left transition-colors cursor-pointer ${
                    selectedType === 'contractor'
                      ? 'bg-zinc-950 text-white border-zinc-950'
                      : 'bg-zinc-50 text-zinc-900 border-zinc-200 hover:border-zinc-400'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                    <Briefcase
                      className={`w-4 h-4 ${
                        selectedType === 'contractor' ? 'text-amber-400' : 'text-zinc-700'
                      }`}
                    />
                    <span>Electrician &amp; Estate Trade</span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      selectedType === 'contractor' ? 'text-zinc-300' : 'text-zinc-500'
                    }`}
                  >
                    Auto-fill jobsite or estate delivery details and track repeat hardware orders.
                  </p>
                </button>
              </div>
            </div>

            {authError && (
              <div
                role="alert"
                className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium"
              >
                {authError}
              </div>
            )}

            <div className="space-y-3 pt-2 border-t border-zinc-200">
              <button
                type="button"
                disabled={authLoading}
                onClick={() => void signInWithGoogle(selectedType)}
                className="w-full h-11 px-5 bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-zinc-950 text-sm font-bold rounded-md inline-flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#18181B"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
                <span>
                  {authLoading
                    ? 'Connecting with Google...'
                    : `Continue with Google (${
                        selectedType === 'contractor' ? 'Trade Account' : 'Customer Account'
                      })`}
                </span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full h-10 px-4 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-300 text-xs font-semibold rounded-md transition-colors cursor-pointer"
              >
                Continue as Guest (No Sign-In Required to Shop)
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Signed-in Navigation Tabs */}
            <div className="px-6 pt-3 border-b border-zinc-200 flex items-center justify-between gap-4 bg-zinc-50">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'profile'
                      ? 'border-zinc-950 text-zinc-950'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Profile &amp; Defaults
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('orders')}
                  className={`px-3.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
                    activeTab === 'orders'
                      ? 'border-zinc-950 text-zinc-950'
                      : 'border-transparent text-zinc-500 hover:text-zinc-900'
                  }`}
                >
                  Orders ({orders.length})
                </button>
              </div>

              <button
                type="button"
                onClick={() => void signOutUser()}
                className="mb-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:text-red-700 hover:bg-red-50 rounded inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            <div className="p-6 max-h-[68vh] overflow-y-auto">
              {activeTab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="acc-type"
                        className="block text-xs font-semibold text-zinc-700 mb-1"
                      >
                        Account Role
                      </label>
                      <select
                        id="acc-type"
                        value={profileAccountType}
                        onChange={(e) =>
                          setProfileAccountType(e.target.value as UserAccountType)
                        }
                        className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                      >
                        <option value="retail">Retail / Homeowner</option>
                        <option value="contractor">Electrician / Estate Trade</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="acc-name"
                        className="block text-xs font-semibold text-zinc-700 mb-1"
                      >
                        Full Name / Primary Contact
                      </label>
                      <input
                        id="acc-name"
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label
                        htmlFor="acc-phone"
                        className="block text-xs font-semibold text-zinc-700 mb-1"
                      >
                        Mobile / WhatsApp Number
                      </label>
                      <input
                        id="acc-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="077 234 8910"
                        className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="acc-company"
                        className="block text-xs font-semibold text-zinc-700 mb-1"
                      >
                        Company / Estate Name (Optional)
                      </label>
                      <input
                        id="acc-company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Highland Electricals (Pvt) Ltd"
                        className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="acc-address"
                        className="block text-xs font-semibold text-zinc-700 mb-1"
                      >
                        Default Delivery / Site Address
                      </label>
                      <input
                        id="acc-address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="No. 42, Main Street, Thalawakale"
                        className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md focus:bg-white focus:outline-none focus:border-zinc-950"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="acc-postal"
                        className="block text-xs font-semibold text-zinc-700 mb-1"
                      >
                        Postal Code
                      </label>
                      <input
                        id="acc-postal"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="22100"
                        className="w-full h-10 px-3 text-sm bg-zinc-50 border border-zinc-300 rounded-md font-mono focus:bg-white focus:outline-none focus:border-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-4">
                    <div className="text-xs text-emerald-700 font-medium">
                      {savedNotice && (
                        <span className="inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Profile saved — Checkout will auto-fill.</span>
                        </span>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={savingProfile}
                      className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-60 text-white text-xs font-semibold rounded-md cursor-pointer"
                    >
                      {savingProfile ? 'Saving...' : 'Save Account Defaults'}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === 'orders' && (
                <div className="space-y-3">
                  {orders.length === 0 ? (
                    <div className="py-10 text-center border border-dashed border-zinc-300 rounded-xl">
                      <Package className="w-6 h-6 text-zinc-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-zinc-900 mb-1">
                        No order history yet
                      </p>
                      <p className="text-xs text-zinc-500">
                        Orders placed via the Order Cart while signed in appear here automatically.
                      </p>
                    </div>
                  ) : (
                    orders.map((o) => (
                      <div
                        key={o.id}
                        className="p-4 border border-zinc-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="text-[11px] font-mono text-zinc-500">
                            {o.orderNumber} · {o.placedAt} · {o.status.toUpperCase()}
                          </p>
                          <p className="font-semibold text-sm text-zinc-950 truncate">
                            {o.deliveryAddress}
                          </p>
                          <p className="text-xs text-zinc-600 mt-0.5">
                            {o.items.length} SKU{o.items.length === 1 ? '' : 's'} ·{' '}
                            {o.paymentMethod === 'pickup'
                              ? 'Pay at Counter'
                              : o.paymentMethod === 'net30'
                                ? 'Bank Transfer / Trade'
                                : o.paymentMethod === 'cod'
                                  ? 'Cash on Delivery'
                                  : 'Card / LankaQR'}
                          </p>
                        </div>

                        <div className="font-mono tabular-nums text-sm font-bold text-zinc-950 whitespace-nowrap shrink-0">
                          {formatCurrency(o.total)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
