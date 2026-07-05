import { getFirebase } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  serverTimestamp,
  QueryConstraint,
} from 'firebase/firestore';
import { Product, Order, NotifyRequest } from './types';

const PRODUCTS_COLLECTION = 'products';
const ORDERS_COLLECTION = 'orders';
const NOTIFY_COLLECTION = 'notifyRequests';

function mapFirestoreDoc(id: string, data: any): Product {
  return {
    id,
    name: data.name || '',
    description: data.description || '',
    price: data.price || 0,
    originalPrice: data.originalPrice || undefined,
    images: data.images || [],
    category: data.category || 'tops',
    sizes: data.sizes || [],
    colors: data.colors || [],
    tags: data.tags || [],
    featured: data.featured || false,
    inStock: data.inStock ?? true,
    stock: data.stock ?? 100,
    rating: data.rating || 0,
    reviews: data.reviews || 0,
    createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || Date.now(),
  };
}

export async function fetchProducts(options?: {
  category?: string;
  featured?: boolean;
}): Promise<Product[]> {
  const { db } = getFirebase();
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

  if (options?.category) {
    constraints.push(where('category', '==', options.category));
  }
  if (options?.featured) {
    constraints.push(where('featured', '==', true));
  }

  const q = query(collection(db, PRODUCTS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => mapFirestoreDoc(doc.id, doc.data()));
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const { db } = getFirebase();
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;
  return mapFirestoreDoc(snapshot.id, snapshot.data());
}

export async function createProduct(
  data: Omit<Product, 'id'>
): Promise<string> {
  const { db } = getFirebase();
  const docRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProduct(
  id: string,
  data: Partial<Omit<Product, 'id'>>
): Promise<void> {
  const { db } = getFirebase();
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await updateDoc(docRef, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(id: string): Promise<void> {
  const { db } = getFirebase();
  const docRef = doc(db, PRODUCTS_COLLECTION, id);
  await deleteDoc(docRef);
}

// ─── Order Functions ──────────────────────────────────────

function mapOrderDoc(id: string, data: any): Order {
  return {
    id,
    items: data.items || [],
    total: data.total || 0,
    subtotal: data.subtotal || 0,
    shipping: data.shipping || 0,
    tax: data.tax || 0,
    status: data.status || 'pending',
    customerEmail: data.customerEmail || '',
    customerName: data.customerName || '',
    shippingAddress: data.shippingAddress || { street: '', city: '', state: '', zip: '', country: '' },
    paymentMethod: data.paymentMethod || '',
    createdAt: data.createdAt?.toMillis?.() || data.createdAt || Date.now(),
    updatedAt: data.updatedAt?.toMillis?.() || data.updatedAt || Date.now(),
  };
}

export async function createOrder(
  data: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const { db } = getFirebase();
  const docRef = await addDoc(collection(db, ORDERS_COLLECTION), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchOrders(options?: {
  status?: string;
}): Promise<Order[]> {
  const { db } = getFirebase();
  const constraints: QueryConstraint[] = [orderBy('createdAt', 'desc')];

  if (options?.status && options.status !== 'All') {
    constraints.push(where('status', '==', options.status.toLowerCase()));
  }

  const q = query(collection(db, ORDERS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => mapOrderDoc(doc.id, doc.data()));
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const { db } = getFirebase();
  const docRef = doc(db, ORDERS_COLLECTION, id);
  const snapshot = await getDoc(docRef);

  if (!snapshot.exists()) return null;
  return mapOrderDoc(snapshot.id, snapshot.data());
}

export async function fetchOrdersByUser(email: string): Promise<Order[]> {
  const { db } = getFirebase();
  const q = query(
    collection(db, ORDERS_COLLECTION),
    where('customerEmail', '==', email),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => mapOrderDoc(doc.id, doc.data()));
}

export async function updateOrderStatus(
  id: string,
  status: Order['status']
): Promise<void> {
  const { db } = getFirebase();
  const docRef = doc(db, ORDERS_COLLECTION, id);
  await updateDoc(docRef, {
    status,
    updatedAt: serverTimestamp(),
  });
}

// ─── Stock Management ─────────────────────────────

export async function reduceProductStock(
  productId: string,
  quantity: number
): Promise<{ success: boolean; stockRemaining: number }> {
  const { db } = getFirebase();
  const docRef = doc(db, PRODUCTS_COLLECTION, productId);

  // Use Firestore transaction for atomic stock reduction
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) {
    return { success: false, stockRemaining: 0 };
  }

  const currentStock = snapshot.data().stock ?? 100;
  if (currentStock < quantity) {
    return { success: false, stockRemaining: currentStock };
  }

  const newStock = currentStock - quantity;
  const updateData: any = {
    stock: newStock,
    updatedAt: serverTimestamp(),
  };

  // If stock hits 0, mark as out of stock
  if (newStock <= 0) {
    updateData.inStock = false;
  }

  await updateDoc(docRef, updateData);
  return { success: true, stockRemaining: newStock };
}

// ─── Notify Me ──────────────────────────────────────

export async function addNotifyRequest(
  data: Omit<NotifyRequest, 'id' | 'createdAt' | 'notified'>
): Promise<string> {
  const { db } = getFirebase();
  // Check if already requested
  const q = query(
    collection(db, NOTIFY_COLLECTION),
    where('productId', '==', data.productId),
    where('userEmail', '==', data.userEmail),
    where('notified', '==', false)
  );
  const existing = await getDocs(q);
  if (!existing.empty) {
    return existing.docs[0].id; // Already requested
  }

  const docRef = await addDoc(collection(db, NOTIFY_COLLECTION), {
    ...data,
    notified: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function seedProducts(): Promise<void> {
  const { db } = getFirebase();

  // Check if products already exist
  const existing = await getDocs(collection(db, PRODUCTS_COLLECTION));
  if (!existing.empty) return; // already seeded

  // Import sample products dynamically to avoid circular deps
  const { sampleProducts } = await import('./sample-products');

  const batch = sampleProducts.map((product) => ({
    ...product,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }));

  for (const product of batch) {
    // Remove id so Firestore auto-generates it
    const { id, ...data } = product as any;
    await addDoc(collection(db, PRODUCTS_COLLECTION), data);
  }
}
