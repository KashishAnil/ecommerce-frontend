import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useAppSelector } from "../hooks/redux";
import type { CartItem, CartResponse, Category, Product } from "../types";
import { apiFetch } from "../utils/api";

export const CART_UPDATED_EVENT = "grove:cart-updated";

export function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

type ShopContextValue = {
  categories: Category[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartLoading: boolean;
  refreshCart: () => Promise<void>;
  refreshCategories: () => Promise<void>;
};

const ShopContext = createContext<ShopContextValue | null>(null);

export function asProduct(item: CartItem): Product | null {
  return typeof item.product === "object" && item.product ? item.product : null;
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const { token, role } = useAppSelector((s) => s.auth);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartLoading, setCartLoading] = useState(false);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await apiFetch<Category[]>("/categories");
      setCategories(data || []);
    } catch {
      setCategories([]);
    }
  }, []);

  const refreshCart = useCallback(async () => {
    if (!token || role !== "Customer") {
      setCartItems([]);
      return;
    }
    setCartLoading(true);
    try {
      const data = await apiFetch<CartResponse>("/cart");
      setCartItems(data.cartExists?.items || []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (/empty/i.test(msg)) setCartItems([]);
      else setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [token, role]);

  useEffect(() => {
    refreshCategories();
  }, [refreshCategories]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const onUpdate = () => {
      refreshCart();
    };
    window.addEventListener(CART_UPDATED_EVENT, onUpdate);
    return () => window.removeEventListener(CART_UPDATED_EVENT, onUpdate);
  }, [refreshCart]);

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => {
        const p = asProduct(item);
        return sum + (p?.price ?? 0) * (item.quantity ?? 0);
      }, 0),
    [cartItems],
  );

  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [cartItems],
  );

  const value = useMemo(
    () => ({
      categories,
      cartOpen,
      setCartOpen,
      cartItems,
      cartCount,
      cartTotal,
      cartLoading,
      refreshCart,
      refreshCategories,
    }),
    [
      categories,
      cartOpen,
      cartItems,
      cartCount,
      cartTotal,
      cartLoading,
      refreshCart,
      refreshCategories,
    ],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used within ShopProvider");
  return ctx;
}
