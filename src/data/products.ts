import { Product, Review, DiscountCode } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  // NEW LIMITED DROP ITEMS
  {
    id: 'sf-h01',
    name: 'SHADOW FAITH Oversized Eye & Bandana Zip Hoodie',
    slug: 'shadow-faith-oversized-eye-bandana-zip-hoodie',
    category: 'Hoodies',
    price: 2499,
    originalPrice: 2999,
    rating: 5.0,
    reviewsCount: 64,
    description: 'Limited Drop 008 oversized zip hoodie from SHADOW FAITH™. Features a custom zip-up hood with integrated Eye of Faith balaclava mask, hidden smile graphic, bandana "68" lion collage chest print, and bold gothic Shadow Faith back print.',
    details: {
      materials: ['100% Heavyweight Cotton', '520 GSM Fleece', 'Integrated Rib Balaclava Mask'],
      care: ['Hand wash cold inside out', 'Hang dry in shade', 'Do not tumble dry'],
      fit: 'Extreme oversized boxy fit with dropped shoulders and built-in face zip mask.',
      origin: 'SHADOW FAITH Drop 008. Limited Edition.'
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Pitch Black', hex: '#0a0a0a' }
    ],
    images: [
      '/images/shadow_faith_hoodie_cover.jpg',
      '/1ff0ed0a-a831-4334-ae6e-00bd0df3a7af.png'
    ],
    isNew: true,
    isFeatured: true,
    inStock: true,
    stockCount: 15,
    tags: ['Heavyweight', 'Zip Hoodie', 'Balaclava', 'Shadow Faith', 'Gothic', 'Limited Drop'],
    sku: 'SF-HDY-008'
  },
  {
    id: 'prx-t04',
    name: 'PRAX "Define Your Edge" Heavyweight Boxy Tee',
    slug: 'prax-define-your-edge-heavyweight-boxy-tee',
    category: 'T-Shirts',
    price: 999,
    originalPrice: 1299,
    rating: 4.9,
    reviewsCount: 89,
    description: 'Signature PRAX Studio heavy cotton tee featuring sharp left-chest "PRAX DEFINE YOUR EDGE" typography and custom woven authentic patch on lower right hem.',
    details: {
      materials: ['100% Combed Heavy Cotton', '340 GSM Luxury Jersey', 'High-density Screenprint'],
      care: ['Machine wash cold inside out', 'Tumble dry low'],
      fit: 'Boxy streetwear cut with drop shoulder and thick collar.',
      origin: 'PRAX Studio ESTD. 2024. Built Different.'
    },
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Jet Black', hex: '#0d0d0d' }
    ],
    images: [
      '/images/prax_boxy_tee_cover.jpg',
      '/729f7114-76fb-447c-93b3-43cc92421896.png'
    ],
    isNew: true,
    isFeatured: true,
    inStock: true,
    stockCount: 35,
    tags: ['Essential', 'Boxy Tee', 'PRAX Studio', 'Heavyweight'],
    sku: 'PRX-TEE-004'
  },
  {
    id: 'hh-h01',
    name: 'HIP HOP "Legends Never Die" Holographic Leather Hoodie',
    slug: 'hip-hop-legends-never-die-holographic-leather-hoodie',
    category: 'Hoodies',
    price: 3499,
    originalPrice: 3999,
    rating: 5.0,
    reviewsCount: 42,
    description: 'Statement piece from the Hip-Hop Culture Drop 001. Crafted with soft vegan leather sleeves and a full back holographic graffiti mural featuring turntable graphics, DJ skull, boombox, and spray paint art.',
    details: {
      materials: ['80% Premium Cotton Fleece', '20% Vegan Leather Sleeves', 'Holographic Ink Print'],
      care: ['Specialist leather clean or wipe down sleeves gently', 'Hand wash cold'],
      fit: 'Comfort fit designed for everyday hustle and movement.',
      origin: 'Street Culture Drop 001. Worldwide Shipping.'
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Graffiti Black', hex: '#111111' }
    ],
    images: [
      '/images/hiphop_leather_hoodie_cover.jpg',
      '/0861e5e0-664c-44ea-9873-032bd83ad9a0.png'
    ],
    isNew: true,
    isFeatured: true,
    inStock: true,
    stockCount: 10,
    tags: ['Leather Sleeve', 'Holographic', 'Graffiti', 'Hip Hop', 'Limited Drop'],
    sku: 'HH-HDY-001'
  },
  {
    id: 'sf-j01',
    name: 'SHADOW FAITH "Faith in the Shadows" Graphic Varsity Jacket',
    slug: 'shadow-faith-faith-in-the-shadows-graphic-varsity-jacket',
    category: 'Jackets',
    price: 3999,
    originalPrice: 4499,
    rating: 4.9,
    reviewsCount: 37,
    description: 'Bold graphic varsity bomber jacket from SHADOW FAITH™. Features premium contrast leather sleeves, vibrant teal/red alien back artwork, custom interior lining, snap closure, and signature pendant accent.',
    details: {
      materials: ['Heavyweight Wool Body', 'Genuine Leather Sleeves', 'Quilted Satin Lining'],
      care: ['Specialist dry clean only'],
      fit: 'Oversized structured silhouette with ribbed collar and waist.',
      origin: 'SHADOW FAITH EST. 2024. Lost in Thought. Found in Style.'
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black & Teal', hex: '#0e0e0e' }
    ],
    images: [
      '/images/shadow_faith_varsity_cover.jpg',
      '/1010b611-8775-4013-914c-f2d9658426ea.png'
    ],
    isNew: true,
    isFeatured: true,
    inStock: true,
    stockCount: 8,
    tags: ['Outerwear', 'Varsity Jacket', 'Graphic Print', 'Shadow Faith', 'Limited Drop'],
    sku: 'SF-JCK-001'
  },
  {
    id: 'sf-p01',
    name: 'SHADOW FAITH Gothic Cross Embroidered Sweatpants',
    slug: 'shadow-faith-gothic-cross-embroidered-sweatpants',
    category: 'Pants',
    price: 1999,
    originalPrice: 2299,
    rating: 4.8,
    reviewsCount: 53,
    description: 'Heavyweight washed black fleece sweatpants with bold white gothic cross embroidery on the legs and circular SHADOW FAITH™ emblem patch on the back pocket.',
    details: {
      materials: ['100% Heavyweight Washed Fleece Cotton', '480 GSM Fabric', 'Applique Cross Embroidery'],
      care: ['Machine wash cold inside out', 'Tumble dry low'],
      fit: 'Relaxed straight-leg street drape with elastic drawstring waistband.',
      origin: 'SHADOW FAITH EST. 2024.'
    },
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Washed Charcoal', hex: '#1c1c1c' }
    ],
    images: [
      '/images/shadow_faith_sweatpants_cover.jpg',
      '/93796ab2-86f4-4c5c-ac27-cb026f96a5ce.png'
    ],
    isNew: true,
    isFeatured: true,
    inStock: true,
    stockCount: 18,
    tags: ['Sweatpants', 'Gothic Cross', 'Embroidered', 'Shadow Faith', 'Heavyweight'],
    sku: 'SF-PNT-001'
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    productId: 'sf-h01',
    userName: 'Kaito T.',
    rating: 5,
    title: 'The built-in balaclava mask is genius',
    comment: 'The 520 GSM fleece weight is insane. The integrated face mask zips up smoothly and the bandana print quality is unmatched. Pure heat.',
    date: '2026-08-14',
    verified: true
  },
  {
    id: 'rev-02',
    productId: 'prx-t04',
    userName: 'Marcus V.',
    rating: 5,
    title: 'Clean boxy drape with immaculate stitching',
    comment: 'Heavyweight 340 GSM fabric holds its boxy structure all day. The neck collar doesn’t stretch out and the lower PRAX tag is a nice touch.',
    date: '2026-08-12',
    verified: true
  },
  {
    id: 'rev-03',
    productId: 'hh-h01',
    userName: 'Elena R.',
    rating: 5,
    title: 'Leather sleeves and holographic detail pop so hard',
    comment: 'The holographic graffiti back print catches light like crazy. Leather sleeves feel soft and authentic. Worth every penny.',
    date: '2026-08-11',
    verified: true
  },
  {
    id: 'rev-04',
    productId: 'sf-j01',
    userName: 'Julian S.',
    rating: 5,
    title: 'Showstopper jacket',
    comment: 'Turns heads instantly. The inner lining and back graphic details show the craftsmanship. Easily the sickest drop of 2026.',
    date: '2026-08-09',
    verified: true
  }
];

export const VALID_DISCOUNTS: DiscountCode[] = [
  {
    code: 'PRAX10',
    discountPercent: 10,
    description: '10% off your entire order'
  },
  {
    code: 'WELCOME20',
    discountPercent: 20,
    minSpend: 150,
    description: '20% off orders over $150'
  },
  {
    code: 'FREESHIP',
    discountPercent: 0,
    flatDiscount: 15,
    description: 'Free Express Shipping credit'
  }
];
