import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS, VALID_DISCOUNTS } from './src/data/products.js';
import { supabaseAdmin } from './src/lib/supabaseClient.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(process.cwd(), 'public')));

// In-memory fallback user registry for session resiliency when Supabase users table is not present
const memoryUsers = new Map<string, any>();

// Helper to map DB row (snake_case) to Frontend Product object (camelCase)
function mapProductFromDb(p: any) {
  if (!p) return p;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: Number(p.price),
    originalPrice: p.original_price != null ? Number(p.original_price) : undefined,
    rating: Number(p.rating ?? 5.0),
    reviewsCount: Number(p.reviews_count ?? 0),
    description: p.description,
    details: typeof p.details === 'string' ? JSON.parse(p.details) : (p.details || { materials: [], care: [], fit: '', origin: '' }),
    sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : (p.sizes || []),
    colors: typeof p.colors === 'string' ? JSON.parse(p.colors) : (p.colors || []),
    images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
    isNew: Boolean(p.is_new),
    isFeatured: Boolean(p.is_featured),
    inStock: Boolean(p.in_stock),
    stockCount: Number(p.stock_count ?? 0),
    tags: typeof p.tags === 'string' ? JSON.parse(p.tags) : (p.tags || []),
    sku: p.sku
  };
}

// Helper to map Frontend Product object to DB row (snake_case)
function mapProductToDb(p: any) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    category: p.category,
    price: p.price,
    original_price: p.originalPrice ?? null,
    rating: p.rating ?? 5.0,
    reviews_count: p.reviewsCount ?? 0,
    description: p.description,
    details: p.details || {},
    sizes: p.sizes || [],
    colors: p.colors || [],
    images: p.images || [],
    is_new: p.isNew ?? false,
    is_featured: p.isFeatured ?? false,
    in_stock: p.inStock ?? true,
    stock_count: p.stockCount ?? 0,
    tags: p.tags || [],
    sku: p.sku
  };
}

// Helper to map DB review to Frontend object
function mapReviewFromDb(r: any) {
  if (!r) return r;
  return {
    id: r.id,
    productId: r.product_id,
    userName: r.user_name,
    userAvatar: r.user_avatar,
    rating: Number(r.rating),
    title: r.title,
    comment: r.comment,
    date: r.date,
    verified: Boolean(r.verified)
  };
}

// Helper to map DB user to Frontend user
function mapUserFromDb(u: any) {
  if (!u) return u;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone || '',
    avatar: u.avatar || '',
    addresses: typeof u.addresses === 'string' ? JSON.parse(u.addresses) : (u.addresses || []),
    paymentMethods: typeof u.payment_methods === 'string' ? JSON.parse(u.payment_methods) : (u.payment_methods || []),
    createdAt: u.created_at
  };
}

// Helper to map DB order to Frontend order
function mapOrderFromDb(o: any) {
  if (!o) return o;
  return {
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    userId: o.user_id,
    customerEmail: o.customer_email || '',
    customerName: o.customer_name || 'Valued Customer',
    customerPhone: o.customer_phone || '',
    items: typeof o.items === 'string' ? JSON.parse(o.items) : (o.items || []),
    shippingAddress: typeof o.shipping_address === 'string' ? JSON.parse(o.shipping_address) : (o.shipping_address || {}),
    shippingMethod: typeof o.shipping_method === 'string' ? JSON.parse(o.shipping_method) : (o.shipping_method || {}),
    paymentMethod: typeof o.payment_method === 'string' ? JSON.parse(o.payment_method) : (o.payment_method || {}),
    subtotal: Number(o.subtotal || 0),
    discount: Number(o.discount || 0),
    shippingFee: Number(o.shipping_fee || 0),
    tax: Number(o.tax || 0),
    total: Number(o.total || 0),
    discountCodeApplied: o.discount_code_applied,
    status: o.status || 'placed',
    trackingNumber: o.tracking_number,
    carrier: o.carrier || 'Delhivery Air Express',
    estimatedDelivery: o.estimated_delivery,
    timeline: typeof o.timeline === 'string' ? JSON.parse(o.timeline) : (o.timeline || generateTimeline(o.status || 'placed'))
  };
}

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

// ================= SUPABASE-POWERED API ROUTES ================= //

// 1. PRODUCTS API (SUPABASE BACKED)
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, sortBy, inStock, size, color } = req.query;

    let query = supabaseAdmin.from('products').select('*');

    if (category && category !== 'All') {
      query = query.ilike('category', category as string);
    }

    if (minPrice) {
      query = query.gte('price', Number(minPrice));
    }

    if (maxPrice) {
      query = query.lte('price', Number(maxPrice));
    }

    if (inStock === 'true') {
      query = query.eq('in_stock', true).gt('stock_count', 0);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      query = query.order('is_new', { ascending: false }).order('created_at', { ascending: false });
    } else if (sortBy === 'price_low') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price_high') {
      query = query.order('price', { ascending: false });
    } else if (sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    } else {
      query = query.order('is_featured', { ascending: false });
    }

    const { data: dbProducts, error } = await query;

    if (error || !dbProducts || dbProducts.length === 0) {
      // Fallback to initial local products if Supabase tables are not yet seeded
      let fallback = [...INITIAL_PRODUCTS];
      if (category && category !== 'All') {
        fallback = fallback.filter(p => p.category.toLowerCase() === (category as string).toLowerCase());
      }
      if (search) {
        const q = (search as string).toLowerCase().trim();
        fallback = fallback.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
      }
      return res.json({ products: fallback, total: fallback.length, source: 'fallback' });
    }

    let products = dbProducts.map(mapProductFromDb);

    // Filter in-memory for JSON/Array complex search filters
    if (search) {
      const q = (search as string).toLowerCase().trim();
      products = products.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.tags && p.tags.some((t: string) => t.toLowerCase().includes(q))) ||
        (p.sku && p.sku.toLowerCase().includes(q))
      );
    }

    if (size) {
      products = products.filter(p => p.sizes && p.sizes.includes(size as any));
    }

    if (color) {
      products = products.filter(p => p.colors && p.colors.some((c: any) => c.name.toLowerCase() === (color as string).toLowerCase()));
    }

    res.json({ products, total: products.length, source: 'supabase' });
  } catch (err: any) {
    console.error('Error fetching products from Supabase:', err.message);
    res.json({ products: INITIAL_PRODUCTS, total: INITIAL_PRODUCTS.length, source: 'fallback' });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    const param = req.params.id;

    // Fetch primary product
    const { data: productRows } = await supabaseAdmin
      .from('products')
      .select('*')
      .or(`id.eq.${param},slug.eq.${param}`)
      .limit(1);

    const dbProduct = productRows && productRows[0];
    const product = dbProduct ? mapProductFromDb(dbProduct) : INITIAL_PRODUCTS.find(p => p.id === param || p.slug === param);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Fetch related products
    const { data: relatedRows } = await supabaseAdmin
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', product.id)
      .limit(4);

    const related = relatedRows && relatedRows.length > 0
      ? relatedRows.map(mapProductFromDb)
      : INITIAL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);

    // Fetch reviews
    const { data: reviewRows } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('product_id', product.id)
      .order('created_at', { ascending: false });

    const reviews = reviewRows && reviewRows.length > 0
      ? reviewRows.map(mapReviewFromDb)
      : INITIAL_REVIEWS.filter(r => r.productId === product.id);

    res.json({ product, related, reviews });
  } catch (err: any) {
    console.error('Error in GET /api/products/:id:', err.message);
    const product = INITIAL_PRODUCTS.find(p => p.id === req.params.id || p.slug === req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json({
      product,
      related: INITIAL_PRODUCTS.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4),
      reviews: INITIAL_REVIEWS.filter(r => r.productId === product.id)
    });
  }
});

// 2. REVIEWS API (SUPABASE BACKED)
app.get('/api/products/:id/reviews', async (req, res) => {
  try {
    const { data: reviewRows, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .eq('product_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error || !reviewRows) {
      const fallback = INITIAL_REVIEWS.filter(r => r.productId === req.params.id);
      return res.json({ reviews: fallback });
    }

    res.json({ reviews: reviewRows.map(mapReviewFromDb) });
  } catch (err: any) {
    res.json({ reviews: INITIAL_REVIEWS.filter(r => r.productId === req.params.id) });
  }
});

app.post('/api/products/:id/reviews', async (req, res) => {
  try {
    const { userName, rating, title, comment } = req.body;
    if (!userName || !rating || !comment) {
      return res.status(400).json({ error: 'Missing required review fields' });
    }

    const newReviewDb = {
      id: 'rev-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      product_id: req.params.id,
      user_name: userName,
      rating: Number(rating),
      title: title || 'Verified Purchase Review',
      comment,
      date: new Date().toISOString().split('T')[0],
      verified: true
    };

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .insert([newReviewDb])
      .select()
      .single();

    if (error) {
      console.error('Failed to insert review into Supabase:', error.message);
    }

    // Recalculate average rating for product
    const { data: allReviews } = await supabaseAdmin
      .from('reviews')
      .select('rating')
      .eq('product_id', req.params.id);

    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((acc, curr) => acc + Number(curr.rating), 0) / allReviews.length;
      await supabaseAdmin
        .from('products')
        .update({
          rating: Number(avg.toFixed(1)),
          reviews_count: allReviews.length
        })
        .eq('id', req.params.id);
    }

    res.json({ success: true, review: data ? mapReviewFromDb(data) : mapReviewFromDb(newReviewDb) });
  } catch (err: any) {
    console.error('Error posting review:', err.message);
    res.status(500).json({ error: 'Failed to post review' });
  }
});

// 3. DISCOUNT CODES API
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

// 4. AUTHENTICATION & USER PROFILES API (SUPABASE BACKED WITH IN-MEMORY FALLBACK)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const emailKey = email.toLowerCase().trim();

    // Check in-memory store
    if (memoryUsers.has(emailKey)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Check Supabase if table exists
    try {
      const { data: existing } = await supabaseAdmin
        .from('users')
        .select('id')
        .ilike('email', email)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ error: 'An account with this email already exists' });
      }
    } catch (e) {
      // Ignore if users table missing
    }

    const newUserDb = {
      id: 'usr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      name,
      email: emailKey,
      password, // In production, hash with bcrypt
      phone: '',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
      addresses: [],
      payment_methods: []
    };

    memoryUsers.set(emailKey, newUserDb);

    const { data: inserted, error } = await supabaseAdmin
      .from('users')
      .insert([newUserDb])
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Supabase user register note (using session fallback):', error.message);
    }

    const finalUser = inserted || newUserDb;
    const userObj = mapUserFromDb(finalUser);
    res.json({ success: true, user: userObj });
  } catch (err: any) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const emailKey = email.toLowerCase().trim();
    let userDb: any = null;

    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .ilike('email', emailKey)
        .maybeSingle();
      if (data) userDb = data;
    } catch (e) {
      // Ignore DB fetch errors
    }

    if (!userDb && memoryUsers.has(emailKey)) {
      userDb = memoryUsers.get(emailKey);
    }

    if (!userDb || userDb.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const userObj = mapUserFromDb(userDb);
    res.json({ success: true, user: userObj });
  } catch (err: any) {
    console.error('Error logging in:', err.message);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.put('/api/auth/profile', async (req, res) => {
  try {
    const { userId, name, phone, avatar } = req.body;

    const updates: any = {};
    if (name) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (avatar) updates.avatar = avatar;

    let updated: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .maybeSingle();
      if (data) updated = data;
    } catch (e) {
      // Ignore
    }

    // Check memoryUsers
    for (const [k, u] of memoryUsers.entries()) {
      if (u.id === userId) {
        Object.assign(u, updates);
        if (!updated) updated = u;
      }
    }

    if (!updated) {
      return res.status(404).json({ error: 'User not found or update failed' });
    }

    res.json({ success: true, user: mapUserFromDb(updated) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

app.post('/api/auth/addresses', async (req, res) => {
  try {
    const { userId, address } = req.body;

    let userDb: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (data) userDb = data;
    } catch (e) {}

    if (!userDb) {
      for (const u of memoryUsers.values()) {
        if (u.id === userId) {
          userDb = u;
          break;
        }
      }
    }

    if (!userDb) {
      return res.status(404).json({ error: 'User not found' });
    }

    const addresses = typeof userDb.addresses === 'string' ? JSON.parse(userDb.addresses) : (userDb.addresses || []);

    const newAddr = {
      id: 'addr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      ...address,
      isDefault: addresses.length === 0 || address.isDefault
    };

    if (newAddr.isDefault) {
      addresses.forEach((a: any) => a.isDefault = false);
    }

    addresses.push(newAddr);

    let updated: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .update({ addresses })
        .eq('id', userId)
        .select()
        .maybeSingle();
      if (data) updated = data;
    } catch (e) {}

    userDb.addresses = addresses;

    res.json({
      success: true,
      address: newAddr,
      addresses: updated ? mapUserFromDb(updated).addresses : addresses
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to add address' });
  }
});

app.delete('/api/auth/addresses/:id', async (req, res) => {
  try {
    const { userId } = req.query;

    let userDb: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId as string)
        .maybeSingle();
      if (data) userDb = data;
    } catch (e) {}

    if (!userDb) {
      for (const u of memoryUsers.values()) {
        if (u.id === userId) {
          userDb = u;
          break;
        }
      }
    }

    if (!userDb) {
      return res.status(404).json({ error: 'User not found' });
    }

    let addresses = typeof userDb.addresses === 'string' ? JSON.parse(userDb.addresses) : (userDb.addresses || []);
    addresses = addresses.filter((a: any) => a.id !== req.params.id);

    if (addresses.length > 0 && !addresses.some((a: any) => a.isDefault)) {
      addresses[0].isDefault = true;
    }

    let updated: any = null;
    try {
      const { data } = await supabaseAdmin
        .from('users')
        .update({ addresses })
        .eq('id', userId as string)
        .select()
        .maybeSingle();
      if (data) updated = data;
    } catch (e) {}

    userDb.addresses = addresses;

    res.json({
      success: true,
      addresses: updated ? mapUserFromDb(updated).addresses : addresses
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete address' });
  }
});

// 5. ORDERS & CHECKOUT API (SUPABASE BACKED)
app.post('/api/orders', async (req, res) => {
  try {
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

    const orderId = 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

    const newOrderDb = {
      id: orderId,
      order_number: orderNumber,
      created_at: now.toISOString(),
      user_id: userId || null,
      customer_email: customerEmail,
      customer_name: customerName,
      customer_phone: customerPhone || shippingAddress.phone || '',
      items: items,
      shipping_address: shippingAddress,
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      subtotal: Number(subtotal),
      discount: Number(discount || 0),
      shipping_fee: Number(shippingFee || 0),
      tax: Number(tax || 0),
      total: Number(total),
      discount_code_applied: discountCodeApplied || null,
      status: 'placed',
      tracking_number: `PRX-TRK-${Math.floor(10000000 + Math.random() * 90000000)}`,
      carrier: 'Delhivery Air Express',
      estimated_delivery: new Date(now.getTime() + 86400000 * 3).toISOString().split('T')[0],
      timeline: generateTimeline('placed')
    };

    let insertedOrder: any = null;

    const { data: primaryData, error: orderErr } = await supabaseAdmin
      .from('orders')
      .insert([newOrderDb])
      .select()
      .maybeSingle();

    if (primaryData) {
      insertedOrder = primaryData;
    } else if (orderErr) {
      console.warn('Supabase Order Insert note:', orderErr.message);
      // Fallback: If carrier column is missing in DB schema cache, retry without carrier column
      if (orderErr.message.includes('carrier') || orderErr.message.includes('schema cache')) {
        const { carrier, ...orderDbWithoutCarrier } = newOrderDb;
        const { data: retryData, error: retryErr } = await supabaseAdmin
          .from('orders')
          .insert([orderDbWithoutCarrier])
          .select()
          .maybeSingle();

        if (retryData) {
          insertedOrder = retryData;
        } else if (retryErr) {
          console.warn('Fallback order insert note:', retryErr.message);
        }
      }
    }

    // Update stock levels in Supabase
    for (const item of items) {
      if (item.productId) {
        const { data: p } = await supabaseAdmin
          .from('products')
          .select('stock_count')
          .eq('id', item.productId)
          .single();

        if (p) {
          const newStock = Math.max(0, Number(p.stock_count) - Number(item.quantity));
          await supabaseAdmin
            .from('products')
            .update({
              stock_count: newStock,
              in_stock: newStock > 0
            })
            .eq('id', item.productId);
        }
      }
    }

    const returnedOrder = insertedOrder ? mapOrderFromDb(insertedOrder) : mapOrderFromDb(newOrderDb);
    res.json({ success: true, order: returnedOrder });
  } catch (err: any) {
    console.error('Error creating order:', err.message);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const { userId, email } = req.query;

    let query = supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('user_id', userId as string);
    } else if (email) {
      query = query.ilike('customer_email', email as string);
    }

    const { data: orderRows, error } = await query;

    if (error || !orderRows) {
      return res.json({ orders: [] });
    }

    res.json({ orders: orderRows.map(mapOrderFromDb) });
  } catch (err: any) {
    console.error('Error getting orders:', err.message);
    res.json({ orders: [] });
  }
});

app.get('/api/orders/:orderNumber', async (req, res) => {
  try {
    const param = req.params.orderNumber.toUpperCase().trim();

    const { data: orderRows } = await supabaseAdmin
      .from('orders')
      .select('*')
      .or(`order_number.ilike.${param},tracking_number.ilike.${param},id.ilike.${param}`)
      .limit(1);

    const dbOrder = orderRows && orderRows[0];

    if (!dbOrder) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ order: mapOrderFromDb(dbOrder) });
  } catch (err: any) {
    res.status(404).json({ error: 'Order not found' });
  }
});

// 6. ADMIN DASHBOARD API (SUPABASE BACKED)
app.get('/api/admin/stats', async (req, res) => {
  try {
    const { data: orders } = await supabaseAdmin.from('orders').select('total').order('created_at', { ascending: false });
    const { data: recentOrders } = await supabaseAdmin.from('orders').select('*').order('created_at', { ascending: false }).limit(5);
    const { count: totalProducts } = await supabaseAdmin.from('products').select('*', { count: 'exact', head: true });

    const totalOrders = orders ? orders.length : 0;
    const totalRevenue = orders ? orders.reduce((sum, o) => sum + Number(o.total), 0) : 0;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      avgOrderValue: Number(avgOrderValue.toFixed(2)),
      totalProducts: totalProducts || INITIAL_PRODUCTS.length,
      recentOrders: recentOrders ? recentOrders.map(mapOrderFromDb) : []
    });
  } catch (err: any) {
    res.json({
      totalRevenue: 0,
      totalOrders: 0,
      avgOrderValue: 0,
      totalProducts: INITIAL_PRODUCTS.length,
      recentOrders: []
    });
  }
});

app.put('/api/admin/orders/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const newTimeline = generateTimeline(status);

    const { data: updated, error } = await supabaseAdmin
      .from('orders')
      .update({
        status,
        timeline: newTimeline
      })
      .or(`id.eq.${req.params.id},order_number.eq.${req.params.id}`)
      .select()
      .single();

    if (error || !updated) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({ success: true, order: mapOrderFromDb(updated) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

app.post('/api/admin/reset-products', async (req, res) => {
  try {
    const dbPayload = INITIAL_PRODUCTS.map(mapProductToDb);
    const { data, error } = await supabaseAdmin
      .from('products')
      .upsert(dbPayload)
      .select();

    if (error) {
      console.error('Failed to reset products in Supabase:', error.message);
      return res.status(500).json({ error: error.message });
    }

    res.json({ success: true, count: data ? data.length : INITIAL_PRODUCTS.length, products: INITIAL_PRODUCTS });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
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

// Export app for serverless function wrappers (e.g. Netlify Functions)
export { app };

// Only start standalone HTTP server when not running in Netlify or Lambda serverless environments
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startServer();
}

