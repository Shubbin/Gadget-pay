import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { wishlistService, cartService, authService } from '@/services';
import { User, Product, CartItem } from '@/types';

interface AppState {
  user: User | null;
  cart: CartItem[];
  wishlist: Product[];
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AppContextType extends AppState {
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
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
    user: null, cart: [], wishlist: [], isAuthenticated: false, isLoading: true,
  });

  // Hydrate user on mount
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const fetchProfile = async () => {
        try {
          const user = await authService.getProfile();
          setState(s => ({ ...s, user, isAuthenticated: true, isLoading: false }));
        } catch (error) {
          console.error('Profile fetch failed:', error);
          localStorage.removeItem('auth_token');
          setState(s => ({ ...s, isLoading: false }));
        }
      };
      fetchProfile();
    } else {
      setState(s => ({ ...s, isLoading: false }));
    }
  }, []);

  // Sync with backend on auth change
  useEffect(() => {
    if (state.isAuthenticated) {
      const sync = async () => {
        try {
          const [wish, cart] = await Promise.all([wishlistService.get(), cartService.get()]);
          setState(s => ({ ...s, wishlist: wish, cart }));
        } catch (error) {
          console.error('Sync failed:', error);
        }
      };
      sync();
    }
  }, [state.isAuthenticated]);

  const login = useCallback((user: User, token: string) => {
    localStorage.setItem('auth_token', token);
    setState(s => ({ ...s, user, isAuthenticated: true }));
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setState({ user: null, cart: [], wishlist: [], isAuthenticated: false, isLoading: false });
  }, []);

  const setUser = useCallback((user: User) => {
    setState(s => ({ ...s, user }));
  }, []);

  const addToCart = useCallback(async (product: Product) => {
    setState(s => {
      const existing = s.cart.find(i => i.product.id === product.id);
      const newQuantity = existing ? existing.quantity + 1 : 1;
      
      if (s.isAuthenticated) {
        cartService.sync(product.id, newQuantity); // API call
      }

      if (existing) return { ...s, cart: s.cart.map(i => i.product.id === product.id ? { ...i, quantity: newQuantity } : i) };
      return { ...s, cart: [...s.cart, { product, quantity: 1 }] };
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setState(s => {
      if (s.isAuthenticated) cartService.remove(id); // API call
      return { ...s, cart: s.cart.filter(i => i.product.id !== id) };
    });
  }, []);

  const addToWishlist = useCallback(async (p: Product) => {
    setState(s => {
      if (s.wishlist.some(w => w.id === p.id)) return s; // Check if already in wishlist
      if (s.isAuthenticated) wishlistService.add(p.id); // API call
      return { ...s, wishlist: [...s.wishlist, p] };
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    setState(s => {
      if (s.isAuthenticated) wishlistService.remove(id); // API call
      return { ...s, wishlist: s.wishlist.filter(w => w.id !== id) };
    });
  }, []);

  const cartTotal = state.cart.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const cartCount = state.cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppContext.Provider value={{ ...state, login, logout, setUser, addToCart, removeFromCart, addToWishlist, removeFromWishlist, cartTotal, cartCount }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
