export type Category = 'Hoodies' | 'T-Shirts' | 'Pants' | 'Jackets' | 'Accessories';

export interface ColorOption {
  name: string;
  hex: string;
  bgClass?: string;
}

export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

export interface ProductDetails {
  materials: string[];
  care: string[];
  fit: string;
  origin: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: Category;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewsCount: number;
  description: string;
  details: ProductDetails;
  sizes: Size[];
  colors: ColorOption[];
  images: string[];
  isNew?: boolean;
  isFeatured?: boolean;
  inStock: boolean;
  stockCount: number;
  tags: string[];
  sku: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  title: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface CartItem {
  id: string; // productId-size-color
  productId: string;
  product: Product;
  selectedSize: Size;
  selectedColor: ColorOption;
  quantity: number;
}

export interface WishlistItem {
  productId: string;
  addedAt: string;
}

export interface DiscountCode {
  code: string;
  discountPercent: number;
  flatDiscount?: number;
  minSpend?: number;
  description: string;
}

export interface Address {
  id: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'apple_pay' | 'google_pay';
  cardBrand?: string;
  last4?: string;
  expMonth?: string;
  expYear?: string;
  isDefault: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  addresses: Address[];
  paymentMethods: PaymentMethod[];
  createdAt: string;
}

export type OrderStatus = 'placed' | 'processing' | 'shipped' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface OrderTimeline {
  title: string;
  location: string;
  timestamp: string;
  completed: boolean;
  current: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  userId?: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  shippingAddress: Address;
  shippingMethod: {
    id: string;
    name: string;
    price: number;
    estimatedDays: string;
  };
  paymentMethod: {
    type: string;
    cardBrand?: string;
    last4?: string;
  };
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  discountCodeApplied?: string;
  status: OrderStatus;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery: string;
  timeline: OrderTimeline[];
}

export type Currency = 'USD' | 'EUR' | 'GBP';

export interface FilterState {
  category: Category | 'All';
  searchQuery: string;
  minPrice: number;
  maxPrice: number;
  sizes: Size[];
  colors: string[];
  sortBy: 'featured' | 'newest' | 'price_low' | 'price_high' | 'rating';
  inStockOnly: boolean;
}
