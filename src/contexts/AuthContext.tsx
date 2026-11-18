import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  signInWithPopup,
  signOut,
} from '../lib/firebase';
import {
  SavedOrderRecord,
  SubmittedOrder,
  UserAccountType,
  UserProfile,
} from '../types/store';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  orders: SavedOrderRecord[];
  authReady: boolean;
  authLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: (preferredAccountType?: UserAccountType) => Promise<boolean>;
  signOutUser: () => Promise<void>;
  updateUserProfile: (updates: {
    accountType: UserAccountType;
    displayName: string;
    phone: string;
    companyName: string;
    address: string;
    postalCode: string;
  }) => Promise<void>;
  saveOrderToAccount: (order: SubmittedOrder) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function clampStr(value: string | null | undefined, max: number, fallback = ''): string {
  const clean = (value ?? fallback).trim();
  return clean.length > max ? clean.slice(0, max) : clean;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<SavedOrderRecord[]>([]);
  const [authReady, setAuthReady] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthReady(true);
      if (!firebaseUser) {
        setProfile(null);
        setOrders([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!authReady || !user) return;

    const userPath = `users/${user.uid}`;
    const ordersPath = `users/${user.uid}/orders`;

    const unsubProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        if (snap.exists()) {
          const d = snap.data();
          setProfile({
            uid: String(d.uid ?? user.uid),
            accountType: d.accountType === 'contractor' ? 'contractor' : 'retail',
            displayName: String(d.displayName ?? user.displayName ?? 'Customer'),
            email: String(d.email ?? user.email ?? ''),
            phone: String(d.phone ?? ''),
            companyName: String(d.companyName ?? ''),
            address: String(d.address ?? ''),
            postalCode: String(d.postalCode ?? ''),
          });
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userPath);
      }
    );

    const ordersQuery = query(
      collection(db, 'users', user.uid, 'orders'),
      orderBy('createdAt', 'desc')
    );
    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        const nextOrders: SavedOrderRecord[] = snap.docs.map((docSnap) => {
          const d = docSnap.data();
          return {
            id: docSnap.id,
            orderNumber: String(d.orderNumber ?? docSnap.id),
            placedAt: String(d.placedAt ?? ''),
            status:
              d.status === 'preparing' ||
              d.status === 'dispatched' ||
              d.status === 'collected'
                ? d.status
                : 'confirmed',
            customerName: String(d.customerName ?? ''),
            customerEmail: String(d.customerEmail ?? ''),
            customerPhone: String(d.customerPhone ?? ''),
            deliveryAddress: String(d.deliveryAddress ?? ''),
            postalCode: String(d.postalCode ?? ''),
            paymentMethod:
              d.paymentMethod === 'net30' ||
              d.paymentMethod === 'cod' ||
              d.paymentMethod === 'pickup'
                ? d.paymentMethod
                : 'card',
            paymentStatus:
              d.paymentStatus === 'paid_sandbox' ||
              d.paymentStatus === 'pending_cod' ||
              d.paymentStatus === 'pending_pickup' ||
              d.paymentStatus === 'pending_net30'
                ? d.paymentStatus
                : undefined,
            paymentReference:
              typeof d.paymentReference === 'string' ? d.paymentReference : undefined,
            paymentChannel:
              typeof d.paymentChannel === 'string' ? d.paymentChannel : undefined,
            items: Array.isArray(d.items) ? d.items : [],
            subtotal: Number(d.subtotal ?? 0),
            shipping: Number(d.shipping ?? 0),
            vatIncluded: Number(d.vatIncluded ?? 0),
            total: Number(d.total ?? 0),
          };
        });
        setOrders(nextOrders);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, ordersPath);
      }
    );

    return () => {
      unsubProfile();
      unsubOrders();
    };
  }, [authReady, user]);

  const ensureUserProfile = async (
    firebaseUser: User,
    preferredAccountType: UserAccountType
  ) => {
    const profileRef = doc(db, 'users', firebaseUser.uid);
    const profilePath = `users/${firebaseUser.uid}`;
    let existingSnap;
    try {
      existingSnap = await getDoc(profileRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, profilePath);
    }

    if (!existingSnap.exists()) {
      const payload = {
        uid: firebaseUser.uid,
        accountType: preferredAccountType,
        displayName: clampStr(firebaseUser.displayName, 100, 'Trade Customer'),
        email: clampStr(firebaseUser.email, 160, 'customer@thalawakale.lk'),
        phone: clampStr(firebaseUser.phoneNumber, 30, ''),
        companyName: '',
        address: '',
        postalCode: '22100',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      try {
        await setDoc(profileRef, payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, profilePath);
      }
    }
  };

  const signInWithGoogle = async (
    preferredAccountType: UserAccountType = 'retail'
  ): Promise<boolean> => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await ensureUserProfile(result.user, preferredAccountType);
      return true;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      if (msg.includes('popup-closed-by-user')) {
        setAuthError('Sign-in popup was closed before completing Google authentication.');
      } else if (msg.includes('popup-blocked')) {
        setAuthError('Browser blocked the Google sign-in popup. Please allow popups for this site.');
      } else {
        setAuthError('Could not complete Google Sign-In. Please try again.');
      }
      return false;
    } finally {
      setAuthLoading(false);
    }
  };

  const signOutUser = async () => {
    setAuthError(null);
    await signOut(auth);
  };

  const updateUserProfile = async (updates: {
    accountType: UserAccountType;
    displayName: string;
    phone: string;
    companyName: string;
    address: string;
    postalCode: string;
  }) => {
    if (!user) return;
    const profilePath = `users/${user.uid}`;
    const profileRef = doc(db, 'users', user.uid);
    const payload = {
      accountType: updates.accountType,
      displayName: clampStr(updates.displayName, 100, user.displayName ?? 'Customer'),
      phone: clampStr(updates.phone, 30),
      companyName: clampStr(updates.companyName, 120),
      address: clampStr(updates.address, 200),
      postalCode: clampStr(updates.postalCode, 16),
      updatedAt: serverTimestamp(),
    };
    try {
      await updateDoc(profileRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, profilePath);
    }
  };

  const saveOrderToAccount = async (order: SubmittedOrder) => {
    if (!user) return;
    await ensureUserProfile(user, profile?.accountType ?? 'retail');
    const orderId = order.orderNumber.replace(/[^a-zA-Z0-9_-]/g, '-');
    const orderPath = `users/${user.uid}/orders/${orderId}`;
    const safeItems = order.items.slice(0, 50).map((item) => ({
      productId: clampStr(item.productId, 64),
      variantId: clampStr(item.variantId, 64),
      sku: clampStr(item.sku, 40),
      name: clampStr(item.name, 140),
      variantLabel: clampStr(item.variantLabel, 80),
      unitPrice: Number(item.unitPrice),
      quantity: Math.max(1, Math.floor(item.quantity)),
      image: clampStr(item.image, 200),
    }));

    const payload = {
      orderNumber: clampStr(order.orderNumber, 32),
      userId: user.uid,
      placedAt: clampStr(order.placedAt, 40),
      status: 'confirmed',
      customerName: clampStr(order.customer.fullName, 100),
      customerEmail: clampStr(order.customer.email, 160),
      customerPhone: clampStr(order.customer.phone, 30),
      deliveryAddress: clampStr(
        order.customer.paymentMethod === 'pickup'
          ? 'Counter Pickup — 42 Main St, Thalawakale'
          : order.customer.address,
        200
      ),
      postalCode: clampStr(
        order.customer.paymentMethod === 'pickup' ? '22100' : order.customer.cityStateZip,
        20
      ),
      paymentMethod: order.customer.paymentMethod,
      ...(order.payment
        ? {
            paymentStatus: order.payment.paymentStatus,
            paymentReference: clampStr(order.payment.transactionId, 48),
            paymentChannel: clampStr(order.payment.paymentChannel, 64),
          }
        : {}),
      items: safeItems,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      vatIncluded: Number(order.tax),
      total: Number(order.total),
      createdAt: serverTimestamp(),
    };

    try {
      await setDoc(doc(db, 'users', user.uid, 'orders', orderId), payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, orderPath);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        orders,
        authReady,
        authLoading,
        authError,
        clearAuthError: () => setAuthError(null),
        signInWithGoogle,
        signOutUser,
        updateUserProfile,
        saveOrderToAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
