import dotenv from 'dotenv';
import { supabaseAdmin } from '../src/lib/supabaseClient.js';
import { INITIAL_PRODUCTS, INITIAL_REVIEWS } from '../src/data/products.js';

dotenv.config();

async function seedDatabase() {
  console.log('🚀 Starting product & review seeding to Supabase...');

  // 1. Seed Products
  console.log(`\n📦 Seeding ${INITIAL_PRODUCTS.length} products...`);
  for (const product of INITIAL_PRODUCTS) {
    const dbProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      category: product.category,
      price: product.price,
      original_price: product.originalPrice ?? null,
      rating: product.rating ?? 5.0,
      reviews_count: product.reviewsCount ?? 0,
      description: product.description,
      details: product.details || {},
      sizes: product.sizes || [],
      colors: product.colors || [],
      images: product.images || [],
      is_new: product.isNew ?? false,
      is_featured: product.isFeatured ?? false,
      in_stock: product.inStock ?? true,
      stock_count: product.stockCount ?? 0,
      tags: product.tags || [],
      sku: product.sku
    };

    const { data, error } = await supabaseAdmin
      .from('products')
      .upsert([dbProduct], { onConflict: 'id' })
      .select('id, name')
      .single();

    if (error) {
      console.error(`❌ Failed to upsert product [${product.id}] ${product.name}:`, error.message);
    } else {
      console.log(`✅ Upserted product [${data.id}]: ${data.name}`);
    }
  }

  // 2. Seed Reviews
  console.log(`\n💬 Seeding ${INITIAL_REVIEWS.length} reviews...`);
  for (const review of INITIAL_REVIEWS) {
    const dbReview = {
      id: review.id,
      product_id: review.productId,
      user_name: review.userName,
      user_avatar: review.userAvatar || null,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      date: review.date,
      verified: review.verified ?? true
    };

    const { data, error } = await supabaseAdmin
      .from('reviews')
      .upsert([dbReview], { onConflict: 'id' })
      .select('id, product_id')
      .single();

    if (error) {
      console.error(`❌ Failed to upsert review [${review.id}]:`, error.message);
    } else {
      console.log(`✅ Upserted review [${data.id}] for product [${data.product_id}]`);
    }
  }

  console.log('\n🎉 Seeding process completed successfully!');
}

seedDatabase().catch((err) => {
  console.error('💥 Fatal error during seeding:', err);
  process.exit(1);
});
