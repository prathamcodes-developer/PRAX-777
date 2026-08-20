import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  CartItem,
  User,
  DiscountCode,
  Category,
  FilterState,
  Currency,
  Order,
  Address,
  Size,
  ColorOption
} from '../types';
import { INITIAL_PRODUCTS } from '../data/products';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface StoreContextType {
  products: Product[];
  loadingProducts: boolean;
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  cart: CartItem[];
  addToCart: (product: Product, size: Size, color: ColorOption, quantity?: number) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  cartTotal: number;
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  user: User | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; avatar?: string }) => Promise<boolean>;
  addAddress: (address: Omit<Address, 'id'>) => Promise<boolean>;
  removeAddress: (id: string) => Promise<boolean>;
  discount: DiscountCode | null;
  discountAmount: number;
  applyDiscount: (code: string) => Promise<{ success: boolean; message: string }>;
  removeDiscount: () => void;
  currency: Currency;
  setCurrency: (c: Currency) => void;
  formatPrice: (amountUSD: number) => string;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isAuthOpen: boolean;
  setIsAuthOpen: (open: boolean) => void;
  authMode: 'login' | 'signup';
  setAuthMode: (mode: 'login' | 'signup') => void;
  quickViewProduct: Product | null;
  setQuickViewProduct: (p: Product | null) => void;
  toasts: Toast[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  orders: Order[];
  fetchUserOrders: () => Promise<void>;
  placeOrder: (orderData: any) => Promise<{ success: boolean; order?: Order; error?: string }>;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const CURRENCY_RATES: Record<Currency, { symbol: string; rate: number }> = {
  INR: { symbol: '₹', rate: 1 },
  USD: { symbol: '$', rate: 0.012 },
  EUR: { symbol: '€', rate: 0.011 },
  GBP: { symbol: '£', rate: 0.0095 }
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'All',
    searchQuery: '',
    minPrice: 0,
    maxPrice: 10000,
    sizes: [],
    colors: [],
    sortBy: 'featured',
    inStockOnly: false
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('prax_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('prax_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('prax_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [discount, setDiscount] = useState<DiscountCode | null>(null);
  const [currency, setCurrency] = useState<Currency>('INR');

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Persist cart
  useEffect(() => {
    localStorage.setItem('prax_cart', JSON.stringify(cart));
  }, [cart]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('prax_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Persist user
  useEffect(() => {
    if (user) {
      localStorage.setItem('prax_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('prax_user');
    }
  }, [user]);

  // Toast Helper
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Fetch Products from API with fallback to static
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        const queryParams = new URLSearchParams();
        if (filters.category !== 'All') queryParams.set('category', filters.category);
        if (filters.searchQuery) queryParams.set('search', filters.searchQuery);
        if (filters.minPrice > 0) queryParams.set('minPrice', filters.minPrice.toString());
        if (filters.maxPrice < 10000) queryParams.set('maxPrice', filters.maxPrice.toString());
        if (filters.inStockOnly) queryParams.set('inStock', 'true');
        queryParams.set('sortBy', filters.sortBy);

        const res = await fetch(`/api/products?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.products) setProducts(data.products);
        }
      } catch (err) {
        console.warn('API connection falling back to client state:', err);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, [filters.category, filters.searchQuery, filters.minPrice, filters.maxPrice, filters.inStockOnly, filters.sortBy]);

  // Load orders for user if logged in
  const fetchUserOrders = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/orders?userId=${user.id}&email=${encodeURIComponent(user.email)}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      }
    } catch (e) {
      console.warn('Failed to fetch orders:', e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, [user]);

  // Reset Filters
  const resetFilters = () => {
    setFilters({
      category: 'All',
      searchQuery: '',
      minPrice: 0,
      maxPrice: 10000,
      sizes: [],
      colors: [],
      sortBy: 'featured',
      inStockOnly: false
    });
  };

  // Cart operations
  const addToCart = (product: Product, size: Size, color: ColorOption, quantity = 1) => {
    const itemId = `${product.id}-${size}-${color.name}`;
    setCart(prev => {
      const existing = prev.find(i => i.id === itemId);
      if (existing) {
        return prev.map(i => i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { id: itemId, productId: product.id, product, selectedSize: size, selectedColor: color, quantity }];
    });

    addToast(`Added ${product.name} (${size} / ${color.name}) to cart`, 'success');
    setIsCartOpen(true);
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(i => {
          if (i.id === cartItemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(i => i.id !== cartItemId));
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(null);
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  let discountAmount = 0;
  if (discount) {
    if (discount.discountPercent > 0) {
      discountAmount = (cartSubtotal * discount.discountPercent) / 100;
    } else if (discount.flatDiscount) {
      discountAmount = discount.flatDiscount;
    }
  }

  const cartTotal = Math.max(0, cartSubtotal - discountAmount);

  // Wishlist
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed from wishlist', 'info');
        return prev.filter(id => id !== productId);
      } else {
        addToast('Added to wishlist', 'success');
        return [...prev, productId];
      }
    });
  };

  const isWishlisted = (productId: string) => wishlist.includes(productId);

  // Discount
  const applyDiscount = async (code: string) => {
    try {
      const res = await fetch('/api/discounts/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, subtotal: cartSubtotal })
      });
      const data = await res.json();
      if (res.ok && data.valid) {
        setDiscount(data.discount);
        addToast(`Code ${data.discount.code} applied successfully!`, 'success');
        return { success: true, message: 'Discount applied!' };
      } else {
        addToast(data.error || 'Invalid code', 'error');
        return { success: false, message: data.error || 'Invalid code' };
      }
    } catch {
      // Local fallback for codes
      if (code.toUpperCase() === 'PRAX10') {
        const disc: DiscountCode = { code: 'PRAX10', discountPercent: 10, description: '10% off entire order' };
        setDiscount(disc);
        addToast('Code PRAX10 applied (10% off)!', 'success');
        return { success: true, message: '10% off applied' };
      }
      return { success: false, message: 'Invalid or expired code' };
    }
  };

  const removeDiscount = () => {
    setDiscount(null);
    addToast('Discount code removed', 'info');
  };

  // Auth
  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setIsAuthOpen(false);
        addToast(`Welcome back, ${data.user.name}!`, 'success');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (e) {
      return { success: false, error: 'Network error logging in' };
    }
  };

  const register = async (name: string, email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password: pass })
      });
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
        setIsAuthOpen(false);
        addToast(`Welcome to PRAX Studio, ${data.user.name}!`, 'success');
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Registration failed' };
      }
    } catch (e) {
      return { success: false, error: 'Network error registering' };
    }
  };

  const logout = () => {
    setUser(null);
    setOrders([]);
    addToast('Logged out successfully', 'info');
  };

  const updateProfile = async (data: { name?: string; phone?: string; avatar?: string }) => {
    if (!user) return false;
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...data })
      });
      const json = await res.json();
      if (res.ok && json.user) {
        setUser(json.user);
        addToast('Profile updated successfully', 'success');
        return true;
      }
    } catch {
      setUser(prev => prev ? { ...prev, ...data } : null);
      addToast('Profile updated locally', 'success');
      return true;
    }
    return false;
  };

  const addAddress = async (addressData: Omit<Address, 'id'>) => {
    if (!user) return false;
    try {
      const res = await fetch('/api/auth/addresses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, address: addressData })
      });
      const data = await res.json();
      if (res.ok && data.addresses) {
        setUser({ ...user, addresses: data.addresses });
        addToast('Shipping address saved', 'success');
        return true;
      }
    } catch {
      const newAddr: Address = {
        id: 'addr-' + Date.now(),
        ...addressData,
        isDefault: user.addresses.length === 0 || addressData.isDefault
      };
      const updated = [...user.addresses, newAddr];
      setUser({ ...user, addresses: updated });
      addToast('Address added', 'success');
      return true;
    }
    return false;
  };

  const removeAddress = async (id: string) => {
    if (!user) return false;
    try {
      const res = await fetch(`/api/auth/addresses/${id}?userId=${user.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok && data.addresses) {
        setUser({ ...user, addresses: data.addresses });
        addToast('Address removed', 'info');
        return true;
      }
    } catch {
      const updated = user.addresses.filter(a => a.id !== id);
      setUser({ ...user, addresses: updated });
      addToast('Address removed', 'info');
      return true;
    }
    return false;
  };

  // Place Order
  const placeOrder = async (orderPayload: any) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          customerEmail: user?.email || orderPayload.email,
          customerName: user?.name || orderPayload.shippingAddress.fullName,
          items: cart,
          subtotal: cartSubtotal,
          discount: discountAmount,
          discountCodeApplied: discount?.code,
          ...orderPayload
        })
      });
      const data = await res.json();
      if (res.ok && data.order) {
        clearCart();
        addToast(`Order #${data.order.orderNumber} confirmed!`, 'success');
        if (user) {
          fetchUserOrders();
        }
        return { success: true, order: data.order };
      } else {
        return { success: false, error: data.error || 'Order placement failed' };
      }
    } catch (e) {
      return { success: false, error: 'Network error placing order' };
    }
  };

  // Currency
  const formatPrice = (amount: number) => {
    const info = CURRENCY_RATES[currency] || CURRENCY_RATES.INR;
    const converted = amount * info.rate;
    if (currency === 'INR') {
      return `₹${Math.round(converted).toLocaleString('en-IN')}`;
    }
    return `${info.symbol}${converted.toFixed(2)}`;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        loadingProducts,
        filters,
        setFilters,
        resetFilters,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        cartSubtotal,
        cartTotal,
        wishlist,
        toggleWishlist,
        isWishlisted,
        user,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        discount,
        discountAmount,
        applyDiscount,
        removeDiscount,
        currency,
        setCurrency,
        formatPrice,
        isCartOpen,
        setIsCartOpen,
        isSearchOpen,
        setIsSearchOpen,
        isAuthOpen,
        setIsAuthOpen,
        authMode,
        setAuthMode,
        quickViewProduct,
        setQuickViewProduct,
        toasts,
        addToast,
        removeToast,
        orders,
        fetchUserOrders,
        placeOrder
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
