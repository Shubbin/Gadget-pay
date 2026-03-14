import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Product } from '@/services';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface AppState {
  user: User | null;
  cart: CartItem[];
  wishlist: Product[];
  isAuthenticated: boolean;
}

interface AppContextType extends AppState {
  login: (user: User) => void;
  logout: () => void;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  addToWishlist: (product: Product) => void;
  removeFromWishlist: (productId: string) => void;
  cartTotal: number;
  cartCount: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppState>({
    user: null, cart: [], wishlist: [], isAuthenticated: false,
  });

  const login = useCallback((user: User) => setState(s => ({ ...s, user, isAuthenticated: true })), []);
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setState({ user: null, cart: [], wishlist: [], isAuthenticated: false });
  }, []);

  const addToCart = useCallback((product: Product) => {
    setState(s => {
      const existing = s.cart.find(i => i.product.id === product.id);
      if (existing) return { ...s, cart: s.cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
      return { ...s, cart: [...s.cart, { product, quantity: 1 }] };
    });
  }, []);

  const removeFromCart = useCallback((id: string) => setState(s => ({ ...s, cart: s.cart.filter(i => i.product.id !== id) })), []);
  const addToWishlist = useCallback((p: Product) => setState(s => ({ ...s, wishlist: s.wishlist.some(w => w.id === p.id) ? s.wishlist : [...s.wishlist, p] })), []);
  const removeFromWishlist = useCallback((id: string) => setState(s => ({ ...s, wishlist: s.wishlist.filter(w => w.id !== id) })), []);

  const cartTotal = state.cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppContext.Provider value={{ ...state, login, logout, addToCart, removeFromCart, addToWishlist, removeFromWishlist, cartTotal, cartCount }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
