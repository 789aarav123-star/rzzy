export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  sizes: string[];
  colors: string[];
  tags: string[];
  featured: boolean;
  inStock: boolean;
  stock: number;
  rating: number;
  reviews: number;
  createdAt: number;
  updatedAt: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
  color: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  customerEmail: string;
  customerName: string;
  shippingAddress: Address;
  paymentMethod: string;
  createdAt: number;
  updatedAt: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  isOwner: boolean;
  createdAt: number;
}

export interface NotifyRequest {
  id: string;
  productId: string;
  productName: string;
  userEmail: string;
  createdAt: number;
  notified: boolean;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: number;
}
