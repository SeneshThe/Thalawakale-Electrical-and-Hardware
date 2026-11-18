export type CategoryId =
  | 'all'
  | 'power-tools'
  | 'circuit-panels'
  | 'wiring-conduit'
  | 'testing-meters'
  | 'lighting-led'
  | 'hand-tools'
  | 'plumbing-pvc'
  | 'building-hardware';

export interface ProductVariant {
  id: string;
  label: string;
  priceDelta: number;
  skuSuffix: string;
  stockCount: number;
}

export interface TechnicalSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  shortName: string;
  category: Exclude<CategoryId, 'all'>;
  categoryLabel: string;
  price: number;
  compareAtPrice?: number;
  image: string;
  summary: string;
  compliance: string;
  warranty: string;
  heroFeatured?: boolean;
  heroHeadline?: string;
  specs: TechnicalSpec[];
  variants: ProductVariant[];
}

export interface CategoryInfo {
  id: Exclude<CategoryId, 'all'>;
  label: string;
  shortLabel: string;
  countLabel: string;
}

export interface CartItem {
  productId: string;
  variantId: string;
  sku: string;
  name: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface CheckoutFormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  cityStateZip: string;
  paymentMethod: 'card' | 'net30' | 'cod' | 'pickup';
}

export type PaymentStatus =
  | 'paid_sandbox'
  | 'pending_cod'
  | 'pending_pickup'
  | 'pending_net30';

export interface PaymentTransaction {
  transactionId: string;
  gateway: 'card-sandbox' | 'lankaqr-sandbox' | 'offline-counter' | 'trade-credit';
  paymentStatus: PaymentStatus;
  paymentChannel: string;
  authorizedAt: string;
}

export interface SubmittedOrder {
  orderNumber: string;
  placedAt: string;
  customer: CheckoutFormData;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  payment?: PaymentTransaction;
}

export type UserAccountType = 'retail' | 'contractor';

export interface UserProfile {
  uid: string;
  accountType: UserAccountType;
  displayName: string;
  email: string;
  phone: string;
  companyName: string;
  address: string;
  postalCode: string;
}

export interface SavedOrderRecord {
  id: string;
  orderNumber: string;
  placedAt: string;
  status: 'confirmed' | 'preparing' | 'dispatched' | 'collected';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  postalCode: string;
  paymentMethod: CheckoutFormData['paymentMethod'];
  paymentStatus?: PaymentStatus;
  paymentReference?: string;
  paymentChannel?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  vatIncluded: number;
  total: number;
}
