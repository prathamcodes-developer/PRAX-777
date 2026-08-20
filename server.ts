import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, VALID_DISCOUNTS } from './src/data/products.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// In-memory persistent data stores (seeded with initial data)
let productsStore = [...INITIAL_PRODUCTS];
let reviewsStore = [...INITIAL_REVIEWS];
let usersStore: any[] = [
  {
    id: 'usr-01',
    name: 'Prax Collector',
    email: 'mr.praxlabs@gmail.com',
    password: 'password123',
    phone: '+1 (555) 019-2834',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    createdAt: '2026-01-15T00:00:00.000Z',
    addresses: [
      {
        id: 'addr-01',
        fullName: 'Prax Collector',
        addressLine1: '742 Fashion Avenue, Suite 12',
        addressLine2: '',
        city: 'New York',
        state: 'NY',
        postalCode: '10018',
        country: 'United States',
        phone: '+1 (555) 019-2834',
        isDefault: true
      }
    ],
    paymentMethods: [
      {
        id: 'pm-01',
        type: 'card',
        cardBrand: 'Visa',
        last4: '4242',
        expMonth: '12',
        expYear: '28',
        isDefault: true
      }
    ]
  }
];

let ordersStore: any[] = [
  {
    id: 'ord-1001',
    orderNumber: 'PRX-84920',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    userId: 'usr-01',
    customerEmail: 'mr.praxlabs@gmail.com',
    customerName: 'Prax Collector',
    customerPhone: '+1 (555) 019-2834',
    items: [
      {
        id: 'sf-h01-L-Pitch Black',
        productId: 'sf-h01',
        product: INITIAL_PRODUCTS[0],
        selectedSize: 'L',
        selectedColor: INITIAL_PRODUCTS[0].colors[0],
        quantity: 1
      }
    ],
    shippingAddress: {
      id: 'addr-01',
      fullName: 'Prax Collector',
      addressLine1: '742 Fashion Avenue, Suite 12',
      city: 'New York',
      state: 'NY',
      postalCode: '10018',
      country: 'United States',
      phone: '+1 (555) 019-2834',
      isDefault: true
    },
    shippingMethod: {
      id: 'express',
      name: 'DHL Express Courier',
      price: 25,
      estimatedDays: '1-2 Business Days'
    },
    paymentMethod: {
      type: 'Credit Card',
      cardBrand: 'Visa',
      last4: '4242'
    },
    subtotal: 185,
    discount: 18.5,
    shippingFee: 25,
    tax: 14.8,
    total: 206.3,
    discountCodeApplied: 'PRAX10',
    status: 'shipped',
    trackingNumber: 'DHL-9840129384-US',
    carrier: 'DHL Express',
    estimatedDelivery: new Date(Date.now() + 86400000 * 1).toISOString().split('T')[0],
    timeline: [
      { title: 'Order Placed & Verified', location: 'PRAX Studio NY', timestamp: '2 days ago', completed: true, current: false },
      { title: 'Quality Inspection & Packaging', location: 'PRAX Fulfillment Hub', timestamp: '1 day ago', completed: true, current: false },
      { title: 'Departed Facility - In Transit', location: 'JFK DHL Sort Facility', timestamp: '10 hours ago', completed: true, current: true },
      { title: 'Out for Delivery', location: 'Local Destination Depot', timestamp: 'Expected Tomorrow', completed: false, current: false },
      { title: 'Delivered', location: 'Destination Address', timestamp: 'Pending', completed: false, current: false }
    ]
  }
];

// Helper to generate order timeline
function generateTimeline(status: string) {
  const isPlaced = true;
  const isProc = ['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status);
  const isShip = ['shipped', 'out_for_delivery', 'delivered'].includes(status);
  const isOut = ['out_for_delivery', 'delivered'].includes(status);
  const isDeliv = status === 'delivered';

  return [
    { title: 'Order Placed & Verified', location: 'PRAX Online Studio', timestamp: 'Just now', completed: isPlaced, current: status === 'placed' },
    { title: 'Quality Inspection & Custom Packaging', location: 'PRAX Fulfillment Center', timestamp: isProc ? 'Completed' : 'In Progress', completed: isProc, current: status === 'processing' },
    { title: 'Dispatched via Express Courier', location: 'DHL Express Global Facility', timestamp: isShip ? 'In Transit' : 'Pending', completed: isShip, current: status === 'shipped' },
    { title: 'Out for Delivery', location: 'Local Courier Hub', timestamp: isOut ? 'Out on Vehicle' : 'Pending', completed: isOut, current: status === 'out_for_delivery' },
    { title: 'Delivered', location: 'Destination Address', timestamp: isDeliv ? 'Delivered & Signed' : 'Pending', completed: isDeliv, current: false }
  ];
}

// ================= API ROUTES ================= //

// 1. PRODUCTS
app.get('/api/products', (req, res) => {
  let result = [...productsStore];
  const { category, search, minPrice, maxPrice, sortBy, inStock, size, color } = req.query;

  if (category && category !== 'All') {
    result = result.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
  }

  if (search) {
    const q = (search as string).toLowerCase().trim();
    result = result.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q)) ||
      p.sku.toLowerCase().includes(q)
    );
  }

  if (minPrice) {
    result = result.filter(p => p.price >= Number(minPrice));
  }

  if (maxPrice) {
    result = result.filter(p => p.price <= Number(maxPrice));
  }

  if (inStock === 'true') {
    result = result.filter(p => p.inStock && p.stockCount > 0);
  }

  if (size) {
    result = result.filter(p => p.sizes.includes(size as any));
  }

  if (color) {
    result = result.filter(p => p.colors.some(c => c.name.toLowerCase() === (color as string).toLowerCase()));
  }

  // Sorting
  if (sortBy === 'newest') {
    result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
  } else if (sortBy === 'price_low') {
    result.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'price_high') {
    result.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'rating') {
    result.sort((a, b) => b.rating - a.rating);
  } else {
    // default featured
    result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
  }

  res.json({ products: result, total: result.length });
});

app.get('/api/products/:id', (req, res) => {
  const product = productsStore.find(p => p.id === req.params.id || p.slug === req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  const related = productsStore.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const reviews = reviewsStore.filter(r => r.productId === product.id);
  res.json({ product, related, reviews });
});

// 2. REVIEWS
app.get('/api/products/:id/reviews', (req, res) => {
  const reviews = reviewsStore.filter(r => r.productId === req.params.id);
  res.json({ reviews });
});

app.post('/api/products/:id/reviews', (req, res) => {
  const { userName, rating, title, comment } = req.body;
  if (!userName || !rating || !comment) {
    return res.status(400).json({ error: 'Missing required review fields' });
  }

  const newReview = {
    id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    productId: req.params.id,
    userName,
    rating: Number(rating),
    title: title || 'Verified Purchase Review',
    comment,
    date: new Date().toISOString().split('T')[0],
    verified: true
  };

  reviewsStore.unshift(newReview);

  // Update product average rating
  const prod = productsStore.find(p => p.id === req.params.id);
  if (prod) {
    const prodReviews = reviewsStore.filter(r => r.productId === prod.id);
    const avg = prodReviews.reduce((acc, curr) => acc + curr.rating, 0) / prodReviews.length;
    prod.rating = Number(avg.toFixed(1));
    prod.reviewsCount = prodReviews.length;
  }

  res.json({ success: true, review: newReview });
});

// 3. DISCOUNT CODES
app.post('/api/discounts/validate', (req, res) => {
  const { code, subtotal } = req.body;
  if (!code) {
    return res.status(400).json({ error: 'Discount code is required' });
  }

  const found = VALID_DISCOUNTS.find(d => d.code.toUpperCase() === code.trim().toUpperCase());
  if (!found) {
    return res.status(404).json({ error: 'Invalid discount code' });
  }

  if (found.minSpend && subtotal < found.minSpend) {
    return res.status(400).json({ error: `Minimum spend of $${found.minSpend} required for code ${found.code}` });
  }

  let amountSaved = 0;
  if (found.discountPercent > 0) {
    amountSaved = (subtotal * found.discountPercent) / 100;
  } else if (found.flatDiscount) {
    amountSaved = found.flatDiscount;
  }

  res.json({
    valid: true,
    discount: found,
    amountSaved: Number(amountSaved.toFixed(2))
  });
});

// 4. AUTHENTICATION & PROFILES
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = usersStore.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name,
    email,
    password,
    phone: '',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80`,
    createdAt: new Date().toISOString(),
    addresses: [],
    paymentMethods: []
  };

  usersStore.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser;
  res.json({ success: true, user: userWithoutPassword });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = usersStore.find(u => u.email.toLowerCase() === email?.toLowerCase());

  if (!user || user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

app.put('/api/auth/profile', (req, res) => {
  const { userId, name, phone, avatar } = req.body;
  const user = usersStore.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (name) user.name = name;
  if (phone !== undefined) user.phone = phone;
  if (avatar) user.avatar = avatar;

  const { password: _, ...userWithoutPassword } = user;
  res.json({ success: true, user: userWithoutPassword });
});

app.post('/api/auth/addresses', (req, res) => {
  const { userId, address } = req.body;
  const user = usersStore.find(u => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const newAddr = {
    id: 'addr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    ...address,
    isDefault: user.addresses.length === 0 || address.isDefault
  };

  if (newAddr.isDefault) {
    user.addresses.forEach((a: any) => a.isDefault = false);
  }

  user.addresses.push(newAddr);
  res.json({ success: true, address: newAddr, addresses: user.addresses });
});

app.delete('/api/auth/addresses/:id', (req, res) => {
  const { userId } = req.query;
  const user = usersStore.find(u => u.id === (userId as string));
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  user.addresses = user.addresses.filter((a: any) => a.id !== req.params.id);
  if (user.addresses.length > 0 && !user.addresses.some((a: any) => a.isDefault)) {
    user.addresses[0].isDefault = true;
  }

  res.json({ success: true, addresses: user.addresses });
});

// 5. ORDERS & CHECKOUT (SUPABASE CONNECTED)
app.post('/api/orders', async (req, res) => {
  const {
    userId,
    customerEmail,
    customerName,
    customerPhone,
    items,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
    discountCodeApplied
  } = req.body;

  if (!items || items.length === 0 || !shippingAddress) {
    return res.status(400).json({ error: 'Cart is empty or shipping address is missing' });
  }

  const randomNum = Math.floor(10000 + Math.random() * 90000);
  const orderNumber = `PRX-${randomNum}`;
  const now = new Date();

  const newOrder = {
    id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    orderNumber,
    createdAt: now.toISOString(),
    userId: userId || null,
    customerEmail,
    customerName,
    customerPhone: customerPhone || shippingAddress.phone || '',
    items,
    shippingAddress,
    shippingMethod,
    paymentMethod,
    subtotal: Number(subtotal),
    discount: Number(discount || 0),
    shippingFee: Number(shippingFee || 0),
    tax: Number(tax || 0),
    total: Number(total),
    discountCodeApplied,
    status: 'placed',
    trackingNumber: `PRX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
    carrier: 'Delhivery Air Express',
    estimatedDelivery: new Date(now.getTime() + 86400000 * 3).toISOString().split('T')[0],
    timeline: generateTimeline('placed')
  };

  ordersStore.unshift(newOrder);

  // Update stock levels
  items.forEach((item: any) => {
    const p = productsStore.find(prod => prod.id === item.productId);
    if (p) {
      p.stockCount = Math.max(0, p.stockCount - item.quantity);
      if (p.stockCount === 0) p.inStock = false;
    }
  });

  res.json({ success: true, order: newOrder });
});

app.get('/api/orders', async (req, res) => {
  const { userId, email } = req.query;
  let userOrders = [...ordersStore];

  if (userId) {
    userOrders = userOrders.filter(o => o.userId === userId);
  } else if (email) {
    userOrders = userOrders.filter(o => o.customerEmail.toLowerCase() === (email as string).toLowerCase());
  }

  res.json({ orders: userOrders });
});

app.get('/api/orders/:orderNumber', (req, res) => {
  const param = req.params.orderNumber.toUpperCase().trim();
  const order = ordersStore.find(o =>
    o.orderNumber.toUpperCase() === param ||
    o.trackingNumber.toUpperCase() === param ||
    o.id.toUpperCase() === param
  );

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({ order });
});

// 6. ADMIN DASHBOARD API
app.get('/api/admin/stats', (req, res) => {
  const totalRevenue = ordersStore.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = ordersStore.length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const totalProducts = productsStore.length;

  res.json({
    totalRevenue: Number(totalRevenue.toFixed(2)),
    totalOrders,
    avgOrderValue: Number(avgOrderValue.toFixed(2)),
    totalProducts,
    recentOrders: ordersStore.slice(0, 5)
  });
});

app.put('/api/admin/orders/:id/status', (req, res) => {
  const { status } = req.body;
  const order = ordersStore.find(o => o.id === req.params.id || o.orderNumber === req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  order.status = status;
  order.timeline = generateTimeline(status);
  res.json({ success: true, order });
});

app.post('/api/admin/reset-products', (req, res) => {
  productsStore = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
  res.json({ success: true, count: productsStore.length, products: productsStore });
});

// ================= VITE DEV / PRODUCTION MIDDLEWARE ================= //
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PRAX Express Server running at http://localhost:${PORT}`);
  });
}

startServer();
