import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import {
  BpTransaction,
  BpWalletSummary,
  DeliveryStatus,
  EcommerceAdminSummary,
  EcommerceCartItem,
  EcommerceOrder,
  EcommerceOrderItem,
  EcommerceProduct,
  OrderDeliveryInfo,
  OrderStatus,
  OrderStatusHistoryEntry,
  PaymentMethod,
  PaymentStatus,
  ProductCategory,
  ProductSpecification,
  ProductVariation,
} from '../src/types/index.js';
import { db as coreDb } from './db.js';

function resolveDbPath(): string {
  const customPath = (process.env.DB_PATH || '').trim();
  if (customPath) {
    const resolvedCustom = path.resolve(customPath);
    const customDir = path.dirname(resolvedCustom);
    try {
      if (!fs.existsSync(customDir)) {
        fs.mkdirSync(customDir, { recursive: true });
      }
      fs.accessSync(customDir, fs.constants.W_OK);
      return resolvedCustom;
    } catch {
      // Fall through to default resolution if custom path is not writable
    }
  }

  const preferredDir = path.resolve(process.cwd(), 'data');
  try {
    if (!fs.existsSync(preferredDir)) {
      fs.mkdirSync(preferredDir, { recursive: true });
    }
    fs.accessSync(preferredDir, fs.constants.W_OK);
    return path.join(preferredDir, 'wdh_ecommerce.db');
  } catch {
    // Fallback for read-only filesystem environments
    const tmpDir = '/tmp/wdh_data';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    return path.join(tmpDir, 'wdh_ecommerce.db');
  }
}

const DB_PATH = resolveDbPath();
const sqlite = new Database(DB_PATH);
try {
  sqlite.pragma('journal_mode = WAL');
} catch {
  // Fallback for shared/network filesystems (e.g. cPanel NFS) that disallow WAL shared memory
  try {
    sqlite.pragma('journal_mode = DELETE');
  } catch {
    // Non-fatal
  }
}
sqlite.pragma('foreign_keys = ON');

// ==========================================
// SCHEMA INITIALIZATION
// ==========================================
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS product_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    subcategories_json TEXT NOT NULL DEFAULT '[]',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    category TEXT NOT NULL,
    subcategory TEXT NOT NULL DEFAULT '',
    price REAL NOT NULL,
    discounted_price REAL,
    bp_value INTEGER NOT NULL DEFAULT 0,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    availability_status TEXT NOT NULL DEFAULT 'in_stock',
    delivery_charge REAL NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    total_sold INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_specifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    spec_key TEXT NOT NULL,
    spec_value TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS product_variations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id TEXT NOT NULL,
    variation_name TEXT NOT NULL,
    options_json TEXT NOT NULL DEFAULT '[]',
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS customers (
    user_id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    whatsapp TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    delivery_address TEXT NOT NULL DEFAULT '',
    city_town_village TEXT NOT NULL DEFAULT '',
    district TEXT NOT NULL DEFAULT '',
    state TEXT NOT NULL DEFAULT '',
    pincode TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    selected_variations_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    whatsapp TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    delivery_address TEXT NOT NULL,
    city_town_village TEXT NOT NULL,
    district TEXT NOT NULL,
    state TEXT NOT NULL,
    pincode TEXT NOT NULL,
    delivery_instructions TEXT NOT NULL DEFAULT '',
    subtotal REAL NOT NULL,
    discount_total REAL NOT NULL DEFAULT 0,
    delivery_charges REAL NOT NULL DEFAULT 0,
    final_amount REAL NOT NULL,
    total_bp INTEGER NOT NULL DEFAULT 0,
    order_status TEXT NOT NULL DEFAULT 'Pending',
    bp_credit_status TEXT NOT NULL DEFAULT 'Pending',
    bp_credited_at TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    product_sku TEXT NOT NULL,
    product_name TEXT NOT NULL,
    product_image TEXT NOT NULL DEFAULT '',
    unit_price REAL NOT NULL,
    unit_discounted_price REAL,
    effective_unit_price REAL NOT NULL,
    unit_bp INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    line_total REAL NOT NULL,
    line_bp INTEGER NOT NULL,
    selected_variations_json TEXT NOT NULL DEFAULT '{}',
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    payment_method TEXT NOT NULL DEFAULT 'COD',
    payment_status TEXT NOT NULL DEFAULT 'Pending',
    amount REAL NOT NULL,
    transaction_id TEXT,
    gateway_order_id TEXT,
    payment_date TEXT,
    refund_status TEXT NOT NULL DEFAULT 'None',
    refund_notes TEXT,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS deliveries (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL UNIQUE,
    partner_name TEXT NOT NULL DEFAULT '',
    tracking_number TEXT NOT NULL DEFAULT '',
    shipment_date TEXT NOT NULL DEFAULT '',
    estimated_delivery_date TEXT NOT NULL DEFAULT '',
    delivery_charges REAL NOT NULL DEFAULT 0,
    tracking_url TEXT NOT NULL DEFAULT '',
    delivery_status TEXT NOT NULL DEFAULT 'Pending',
    notes TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS order_status_history (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    status TEXT NOT NULL,
    note TEXT NOT NULL DEFAULT '',
    updated_by TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS bp_wallets (
    user_id TEXT PRIMARY KEY,
    bp_balance INTEGER NOT NULL DEFAULT 0,
    total_earned INTEGER NOT NULL DEFAULT 0,
    total_reversed INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS bp_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    order_id TEXT NOT NULL,
    type TEXT NOT NULL,
    bp_amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'credited',
    description TEXT NOT NULL,
    items_summary TEXT NOT NULL DEFAULT '',
    created_by TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_bp_unique_credit
    ON bp_transactions(order_id, type)
    WHERE type = 'credit';

  CREATE UNIQUE INDEX IF NOT EXISTS idx_bp_unique_reversal
    ON bp_transactions(order_id, type)
    WHERE type = 'reversal';

  CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
  CREATE INDEX IF NOT EXISTS idx_bp_tx_user ON bp_transactions(user_id);
`);

function nowStr(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 19);
}

// ==========================================
// SECURITY HELPERS FOR URLS & STRINGS
// ==========================================
export function isValidImageUrl(url: string): boolean {
  const trimmed = String(url || '').trim();
  if (!trimmed) return false;
  if (trimmed.startsWith('/assets/') || trimmed.startsWith('/')) return true;
  if (/^https?:\/\/.+/i.test(trimmed)) return true;
  if (/^data:image\/(png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(trimmed)) {
    // Limit base64 payload to ~2.5MB per image
    return trimmed.length <= 3_500_000;
  }
  return false;
}

export function isValidHttpUrl(url: string): boolean {
  const trimmed = String(url || '').trim();
  if (!trimmed) return true; // Optional tracking URL may be empty
  return /^https?:\/\/.+/i.test(trimmed);
}

// ==========================================
// SEED INITIAL CATEGORIES, PRODUCTS & SAMPLE DATA
// ==========================================
function seedIfEmpty() {
  const catCount = (sqlite.prepare('SELECT COUNT(*) as c FROM product_categories').get() as any).c;
  const ts = nowStr();

  if (catCount === 0) {
    const categories: ProductCategory[] = [
      {
        id: 'CAT-01',
        name: 'Daily Essentials',
        slug: 'daily-essentials',
        subcategories: ['Health Drinks', 'Immunity Sachets', 'Home Care'],
      },
      {
        id: 'CAT-02',
        name: 'Personal Care',
        slug: 'personal-care',
        subcategories: ['Face & Skin', 'Hair Care', 'Oral Care'],
      },
      {
        id: 'CAT-03',
        name: 'Health & Wellness',
        slug: 'health-wellness',
        subcategories: ['Supplements', 'Vitality Capsules', 'Nutrition'],
      },
      {
        id: 'CAT-04',
        name: 'Wellness & Devices',
        slug: 'wellness-devices',
        subcategories: ['Alkaline Hydration', 'Smart Therapy', 'Home Wellness'],
      },
      {
        id: 'CAT-05',
        name: 'Electronics & Gadgets',
        slug: 'electronics-gadgets',
        subcategories: ['Fitness Trackers', 'Audio & Mobile', 'Starter Kits'],
      },
      {
        id: 'CAT-06',
        name: 'Agriculture',
        slug: 'agriculture',
        subcategories: ['Bio-Fertilizers', 'Soil Conditioners'],
      },
    ];

    const insertCat = sqlite.prepare(
      'INSERT INTO product_categories (id, name, slug, subcategories_json, created_at) VALUES (?, ?, ?, ?, ?)'
    );
    for (const c of categories) {
      insertCat.run(c.id, c.name, c.slug, JSON.stringify(c.subcategories), ts);
    }
  }

  const prodCount = (sqlite.prepare('SELECT COUNT(*) as c FROM products').get() as any).c;
  if (prodCount === 0) {
    const seedProducts: Array<{
      id: string;
      sku: string;
      name: string;
      description: string;
      category: string;
      subcategory: string;
      price: number;
      discountedPrice: number | null;
      bpValue: number;
      stockQuantity: number;
      deliveryCharge: number;
      isFeatured: boolean;
      totalSold: number;
      images: string[];
      specifications: ProductSpecification[];
      variations: ProductVariation[];
    }> = [
      {
        id: 'PRD-1001',
        sku: 'WDH-SKU-040',
        name: 'WDH Daily Tulsi & Ginger Immunity Drops (Pack)',
        description:
          'Pocket-friendly daily immunity & energy concentrate formulated for active distributors. Ideal starter purchase with instant 1 BP credit per unit.',
        category: 'Daily Essentials',
        subcategory: 'Immunity Sachets',
        price: 40,
        discountedPrice: null,
        bpValue: 1,
        stockQuantity: 450,
        deliveryCharge: 0,
        isFeatured: false,
        totalSold: 312,
        images: [
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'Net Weight', value: '30g Sachet Pack' },
          { key: 'Shelf Life', value: '24 Months' },
          { key: 'Origin', value: 'India (ISO 9001:2020)' },
        ],
        variations: [
          { name: 'Flavor', options: ['Tulsi Ginger', 'Lemon Honey'] },
          { name: 'Pack Size', options: ['Single Pack', 'Value Box'] },
        ],
      },
      {
        id: 'PRD-1002',
        sku: 'WDH-SKU-400',
        name: 'Dream Glow Vitamin-C & Saffron Face Wash',
        description:
          'Deep-cleansing gentle botanical face wash enriched with Vitamin C and Kashmiri Saffron extracts for everyday radiant skin.',
        category: 'Personal Care',
        subcategory: 'Face & Skin',
        price: 450,
        discountedPrice: 400,
        bpValue: 10,
        stockQuantity: 180,
        deliveryCharge: 0,
        isFeatured: true,
        totalSold: 194,
        images: [
          'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'Volume', value: '150 ml Tube' },
          { key: 'Skin Type', value: 'All Skin Types' },
          { key: 'Paraben Free', value: 'Yes (100%)' },
        ],
        variations: [
          { name: 'Size', options: ['150ml', '300ml'] },
          { name: 'Variant', options: ['Saffron Glow', 'Charcoal Detox'] },
        ],
      },
      {
        id: 'PRD-1003',
        sku: 'WDH-SKU-800',
        name: 'Dream Care Panchamrit Superfood Elixir (1 Litre)',
        description:
          'Concentrated wellness nutrition juice combining Giloy, Amla, Tulsi, Aloe Vera and Ashwagandha for daily family stamina and metabolic support.',
        category: 'Health & Wellness',
        subcategory: 'Supplements',
        price: 999,
        discountedPrice: 800,
        bpValue: 20,
        stockQuantity: 120,
        deliveryCharge: 40,
        isFeatured: true,
        totalSold: 148,
        images: [
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'Quantity', value: '1000 ml Bottle' },
          { key: 'Dosage', value: '30 ml twice daily' },
          { key: 'Quality Standard', value: 'GMP & ISO 9001:2020' },
        ],
        variations: [
          { name: 'Weight', options: ['500ml', '1 Litre'] },
          { name: 'Formula', options: ['Sugar Free', 'Classic Honey'] },
        ],
      },
      {
        id: 'PRD-1004',
        sku: 'WDH-SKU-8000',
        name: 'WDH Executive Alkaline Ionizer & Family Wellness Kit',
        description:
          'Complete executive starter and family wellness bundle featuring an Alkaline Mineral Water Pitcher, Ionic Flask, and Digital Health Monitor. Earns 200 BP per kit.',
        category: 'Wellness & Devices',
        subcategory: 'Alkaline Hydration',
        price: 9500,
        discountedPrice: 8000,
        bpValue: 200,
        stockQuantity: 35,
        deliveryCharge: 0,
        isFeatured: true,
        totalSold: 62,
        images: [
          'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'pH Output', value: '8.5 - 9.5 Alkaline' },
          { key: 'Warranty', value: '2 Years Official WVDH Warranty' },
          { key: 'Box Contents', value: 'Ionizer Pitcher + 750ml Flask + Smart Band' },
        ],
        variations: [
          { name: 'Model', options: ['Executive Pro 2026', 'Royal Gold Edition'] },
          { name: 'Color', options: ['Cobalt Blue', 'Obsidian Black'] },
        ],
      },
      {
        id: 'PRD-1005',
        sku: 'WDH-SKU-1600',
        name: 'Himalayan Shilajit & Gold Vitality Complex (60 Caps)',
        description:
          'Purified Himalayan Shilajit fortified with Swarna Bhasma and Safed Musli for peak athletic recovery and daily energy.',
        category: 'Health & Wellness',
        subcategory: 'Vitality Capsules',
        price: 1999,
        discountedPrice: 1600,
        bpValue: 40,
        stockQuantity: 85,
        deliveryCharge: 0,
        isFeatured: false,
        totalSold: 91,
        images: [
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1550572017-edd951b55104?w=600&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'Capsule Count', value: '60 Veg Capsules' },
          { key: 'Fulvic Acid', value: '> 60% Standardized' },
        ],
        variations: [{ name: 'Pack', options: ['60 Capsules', '120 Capsules'] }],
      },
      {
        id: 'PRD-1006',
        sku: 'WDH-SKU-2400',
        name: 'WVDH Smart Pulse Fitness Watch & AdMob Companion',
        description:
          'AMOLED smart fitness watch with 24/7 SpO2, heart-rate tracking, call alerts, and 14-day battery backup designed for active field leaders.',
        category: 'Electronics & Gadgets',
        subcategory: 'Fitness Trackers',
        price: 2999,
        discountedPrice: 2400,
        bpValue: 60,
        stockQuantity: 48,
        deliveryCharge: 0,
        isFeatured: true,
        totalSold: 115,
        images: [
          'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'Display', value: '1.43" AMOLED HD' },
          { key: 'Water Resistance', value: 'IP68 Waterproof' },
          { key: 'Battery', value: 'Up to 14 Days' },
        ],
        variations: [
          { name: 'Color', options: ['Midnight Black', 'Amber Gold', 'Navy Blue'] },
          { name: 'Strap Size', options: ['Standard 22mm', 'Large Sport'] },
        ],
      },
      {
        id: 'PRD-1007',
        sku: 'WDH-SKU-1200',
        name: 'Kisan Vridhi Bio-Organic Crop Yield Multiplier (5L)',
        description:
          'Eco-certified liquid organic nutrient booster enriched with seaweed extract and potassium humate for higher farm yield.',
        category: 'Agriculture',
        subcategory: 'Bio-Fertilizers',
        price: 1500,
        discountedPrice: 1200,
        bpValue: 30,
        stockQuantity: 70,
        deliveryCharge: 60,
        isFeatured: false,
        totalSold: 54,
        images: [
          'https://images.unsplash.com/photo-1592417817098-8f3d6eb22509?w=600&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=600&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'Volume', value: '5 Litre HDPE Can' },
          { key: 'Coverage', value: 'Up to 5 Acres' },
        ],
        variations: [{ name: 'Can Size', options: ['1 Litre', '5 Litre'] }],
      },
      {
        id: 'PRD-1008',
        sku: 'WDH-SKU-600',
        name: 'Royal Kumkumadi Night Repair Serum (30ml)',
        description:
          'Luxurious saffron and hyaluronic acid facial oil serum for overnight skin barrier repair and youthful luminosity.',
        category: 'Personal Care',
        subcategory: 'Face & Skin',
        price: 799,
        discountedPrice: 600,
        bpValue: 15,
        stockQuantity: 0,
        deliveryCharge: 0,
        isFeatured: false,
        totalSold: 87,
        images: [
          'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80',
        ],
        specifications: [
          { key: 'Volume', value: '30 ml Dropper Bottle' },
          { key: 'Key Ingredients', value: 'Mogra Saffron, Rosehip, Hyaluronic' },
        ],
        variations: [{ name: 'Bottle Size', options: ['30ml'] }],
      },
    ];

    const insertProd = sqlite.prepare(`
      INSERT INTO products (
        id, sku, name, description, category, subcategory, price, discounted_price, bp_value,
        stock_quantity, availability_status, delivery_charge, is_featured, is_active, total_sold, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);
    const insertImg = sqlite.prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)');
    const insertSpec = sqlite.prepare('INSERT INTO product_specifications (product_id, spec_key, spec_value, sort_order) VALUES (?, ?, ?, ?)');
    const insertVar = sqlite.prepare('INSERT INTO product_variations (product_id, variation_name, options_json) VALUES (?, ?, ?)');

    const runSeed = sqlite.transaction(() => {
      for (const p of seedProducts) {
        const avail = p.stockQuantity <= 0 ? 'out_of_stock' : p.stockQuantity < 15 ? 'limited' : 'in_stock';
        insertProd.run(
          p.id,
          p.sku,
          p.name,
          p.description,
          p.category,
          p.subcategory,
          p.price,
          p.discountedPrice,
          p.bpValue,
          p.stockQuantity,
          avail,
          p.deliveryCharge,
          p.isFeatured ? 1 : 0,
          p.totalSold,
          ts,
          ts
        );
        p.images.forEach((img, idx) => insertImg.run(p.id, img, idx));
        p.specifications.forEach((s, idx) => insertSpec.run(p.id, s.key, s.value, idx));
        p.variations.forEach((v) => insertVar.run(p.id, v.name, JSON.stringify(v.options)));
      }
    });
    runSeed();
  }

  // Seed 2 initial orders so Order History, Tracking, BP Wallet & Admin KPIs have rich initial records
  const orderCount = (sqlite.prepare('SELECT COUNT(*) as c FROM orders').get() as any).c;
  if (orderCount === 0) {
    const seedOrderTx = sqlite.transaction(() => {
      // Sample Order 1: Delivered & BP Credited for WDH-100001
      sqlite
        .prepare(
          `INSERT INTO orders (
            id, user_id, customer_name, mobile, whatsapp, email, delivery_address,
            city_town_village, district, state, pincode, delivery_instructions,
            subtotal, discount_total, delivery_charges, final_amount, total_bp,
            order_status, bp_credit_status, bp_credited_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'ORD-2026-10001',
          'WDH-100001',
          'Rajesh Sharma',
          '9876543210',
          '9876543210',
          'rajesh.sharma@watchvideodream.in',
          'B-42, Connaught Place',
          'New Delhi',
          'New Delhi',
          'Delhi',
          '110001',
          'Call before delivery',
          1449,
          249,
          0,
          1200,
          30,
          'Delivered',
          'Credited',
          '2026-08-05 14:30:00',
          '2026-08-03 10:15:00',
          '2026-08-05 14:30:00'
        );

      sqlite
        .prepare(
          `INSERT INTO order_items (
            id, order_id, product_id, product_sku, product_name, product_image,
            unit_price, unit_discounted_price, effective_unit_price, unit_bp, quantity,
            line_total, line_bp, selected_variations_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'OITM-10001-1',
          'ORD-2026-10001',
          'PRD-1002',
          'WDH-SKU-400',
          'Dream Glow Vitamin-C & Saffron Face Wash',
          'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600&auto=format&fit=crop&q=80',
          450,
          400,
          400,
          10,
          1,
          400,
          10,
          JSON.stringify({ Size: '150ml', Variant: 'Saffron Glow' })
        );

      sqlite
        .prepare(
          `INSERT INTO order_items (
            id, order_id, product_id, product_sku, product_name, product_image,
            unit_price, unit_discounted_price, effective_unit_price, unit_bp, quantity,
            line_total, line_bp, selected_variations_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'OITM-10001-2',
          'ORD-2026-10001',
          'PRD-1003',
          'WDH-SKU-800',
          'Dream Care Panchamrit Superfood Elixir (1 Litre)',
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80',
          999,
          800,
          800,
          20,
          1,
          800,
          20,
          JSON.stringify({ Weight: '1 Litre', Formula: 'Classic Honey' })
        );

      sqlite
        .prepare(
          `INSERT INTO payments (
            id, order_id, payment_method, payment_status, amount, transaction_id, payment_date, refund_status, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run('PAY-10001', 'ORD-2026-10001', 'COD', 'Paid', 1200, 'COD-COL-10001', '2026-08-05 14:30:00', 'None', '2026-08-05 14:30:00');

      sqlite
        .prepare(
          `INSERT INTO deliveries (
            id, order_id, partner_name, tracking_number, shipment_date, estimated_delivery_date,
            delivery_charges, tracking_url, delivery_status, notes, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'DEL-10001',
          'ORD-2026-10001',
          'Delhivery Express',
          'DLV778291004IN',
          '2026-08-03',
          '2026-08-05',
          0,
          'https://www.delhivery.com/track/package/DLV778291004IN',
          'Delivered',
          'Delivered and signed by Rajesh Sharma.',
          '2026-08-05 14:30:00'
        );

      sqlite
        .prepare(`INSERT INTO order_status_history (id, order_id, status, note, updated_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('OSH-10001-1', 'ORD-2026-10001', 'Pending', 'Order placed via COD', 'WDH-100001', '2026-08-03 10:15:00');
      sqlite
        .prepare(`INSERT INTO order_status_history (id, order_id, status, note, updated_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('OSH-10001-2', 'ORD-2026-10001', 'Delivered', 'COD collected & 30 BP credited to WDH-100001', 'WDH-ADMIN-01', '2026-08-05 14:30:00');

      sqlite
        .prepare(`INSERT INTO bp_wallets (user_id, bp_balance, total_earned, total_reversed, updated_at) VALUES (?, ?, ?, ?, ?)`)
        .run('WDH-100001', 30, 30, 0, '2026-08-05 14:30:00');

      sqlite
        .prepare(
          `INSERT INTO bp_transactions (
            id, user_id, order_id, type, bp_amount, balance_after, status, description, items_summary, created_by, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'BPTX-10001',
          'WDH-100001',
          'ORD-2026-10001',
          'credit',
          30,
          30,
          'credited',
          'Automatic BP Credit for qualifying order ORD-2026-10001',
          '1x Dream Glow Vitamin-C & Saffron Face Wash (₹400 | 10 BP), 1x Dream Care Panchamrit Superfood Elixir (₹800 | 20 BP)',
          'SYSTEM',
          '2026-08-05 14:30:00'
        );

      // Sample Order 2: Pending COD order for WDH-100007 (BP Pending, not yet credited)
      sqlite
        .prepare(
          `INSERT INTO orders (
            id, user_id, customer_name, mobile, whatsapp, email, delivery_address,
            city_town_village, district, state, pincode, delivery_instructions,
            subtotal, discount_total, delivery_charges, final_amount, total_bp,
            order_status, bp_credit_status, bp_credited_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'ORD-2026-10002',
          'WDH-100007',
          'Subhash Chandra Das',
          '9830112244',
          '9830112244',
          'subhash.das@gmail.com',
          '14/2, Rashbehari Avenue, Gariahat',
          'Kolkata',
          'Kolkata',
          'West Bengal',
          '700029',
          'Deliver between 10am - 5pm',
          2999,
          599,
          0,
          2400,
          60,
          'Pending',
          'Pending',
          null,
          '2026-08-09 11:20:00',
          '2026-08-09 11:20:00'
        );

      sqlite
        .prepare(
          `INSERT INTO order_items (
            id, order_id, product_id, product_sku, product_name, product_image,
            unit_price, unit_discounted_price, effective_unit_price, unit_bp, quantity,
            line_total, line_bp, selected_variations_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          'OITM-10002-1',
          'ORD-2026-10002',
          'PRD-1006',
          'WDH-SKU-2400',
          'WVDH Smart Pulse Fitness Watch & AdMob Companion',
          'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=600&auto=format&fit=crop&q=80',
          2999,
          2400,
          2400,
          60,
          1,
          2400,
          60,
          JSON.stringify({ Color: 'Amber Gold', 'Strap Size': 'Standard 22mm' })
        );

      sqlite
        .prepare(
          `INSERT INTO payments (
            id, order_id, payment_method, payment_status, amount, transaction_id, payment_date, refund_status, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run('PAY-10002', 'ORD-2026-10002', 'COD', 'Pending', 2400, null, null, 'None', '2026-08-09 11:20:00');

      sqlite
        .prepare(
          `INSERT INTO deliveries (
            id, order_id, partner_name, tracking_number, shipment_date, estimated_delivery_date,
            delivery_charges, tracking_url, delivery_status, notes, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run('DEL-10002', 'ORD-2026-10002', '', '', '', '', 0, '', 'Pending', 'Awaiting admin order confirmation.', '2026-08-09 11:20:00');

      sqlite
        .prepare(`INSERT INTO order_status_history (id, order_id, status, note, updated_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
        .run('OSH-10002-1', 'ORD-2026-10002', 'Pending', 'Order placed (COD - BP pending confirmation & delivery)', 'WDH-100007', '2026-08-09 11:20:00');
    });
    seedOrderTx();
  }
}

seedIfEmpty();

// ==========================================
// DATA HYDRATION HELPERS
// ==========================================
function hydrateProduct(row: any): EcommerceProduct {
  const imgs = sqlite
    .prepare('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC, id ASC')
    .all(row.id) as { image_url: string }[];
  const specs = sqlite
    .prepare('SELECT spec_key, spec_value FROM product_specifications WHERE product_id = ? ORDER BY sort_order ASC, id ASC')
    .all(row.id) as { spec_key: string; spec_value: string }[];
  const vars = sqlite
    .prepare('SELECT variation_name, options_json FROM product_variations WHERE product_id = ? ORDER BY id ASC')
    .all(row.id) as { variation_name: string; options_json: string }[];

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description,
    category: row.category,
    subcategory: row.subcategory || '',
    price: Number(row.price),
    discountedPrice: row.discounted_price !== null && row.discounted_price !== undefined ? Number(row.discounted_price) : null,
    bpValue: Number(row.bp_value),
    stockQuantity: Number(row.stock_quantity),
    availabilityStatus: row.availability_status,
    deliveryCharge: Number(row.delivery_charge || 0),
    isFeatured: Boolean(row.is_featured),
    isActive: Boolean(row.is_active),
    images: imgs.map((i) => i.image_url),
    specifications: specs.map((s) => ({ key: s.spec_key, value: s.spec_value })),
    variations: vars.map((v) => ({
      name: v.variation_name,
      options: JSON.parse(v.options_json || '[]'),
    })),
    totalSold: Number(row.total_sold || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function hydrateOrder(row: any): EcommerceOrder {
  const itemsRaw = sqlite.prepare('SELECT * FROM order_items WHERE order_id = ?').all(row.id) as any[];
  const paymentRaw = sqlite.prepare('SELECT * FROM payments WHERE order_id = ?').get(row.id) as any;
  const deliveryRaw = sqlite.prepare('SELECT * FROM deliveries WHERE order_id = ?').get(row.id) as any;
  const historyRaw = sqlite
    .prepare('SELECT * FROM order_status_history WHERE order_id = ? ORDER BY created_at ASC, id ASC')
    .all(row.id) as any[];

  const items: EcommerceOrderItem[] = itemsRaw.map((it) => ({
    id: it.id,
    orderId: it.order_id,
    productId: it.product_id,
    productSku: it.product_sku,
    productName: it.product_name,
    productImage: it.product_image,
    unitPrice: Number(it.unit_price),
    unitDiscountedPrice: it.unit_discounted_price !== null ? Number(it.unit_discounted_price) : null,
    effectiveUnitPrice: Number(it.effective_unit_price),
    unitBp: Number(it.unit_bp),
    quantity: Number(it.quantity),
    lineTotal: Number(it.line_total),
    lineBp: Number(it.line_bp),
    selectedVariations: JSON.parse(it.selected_variations_json || '{}'),
  }));

  const delivery: OrderDeliveryInfo = deliveryRaw
    ? {
        partnerName: deliveryRaw.partner_name || '',
        trackingNumber: deliveryRaw.tracking_number || '',
        shipmentDate: deliveryRaw.shipment_date || '',
        estimatedDeliveryDate: deliveryRaw.estimated_delivery_date || '',
        deliveryCharges: Number(deliveryRaw.delivery_charges || 0),
        trackingUrl: deliveryRaw.tracking_url || '',
        deliveryStatus: (deliveryRaw.delivery_status || 'Pending') as DeliveryStatus,
        notes: deliveryRaw.notes || '',
        updatedAt: deliveryRaw.updated_at || row.updated_at,
      }
    : {
        partnerName: '',
        trackingNumber: '',
        shipmentDate: '',
        estimatedDeliveryDate: '',
        deliveryCharges: Number(row.delivery_charges || 0),
        trackingUrl: '',
        deliveryStatus: 'Pending',
        notes: '',
        updatedAt: row.updated_at,
      };

  const statusHistory: OrderStatusHistoryEntry[] = historyRaw.map((h) => ({
    id: h.id,
    orderId: h.order_id,
    status: h.status,
    note: h.note,
    updatedBy: h.updated_by,
    createdAt: h.created_at,
  }));

  return {
    id: row.id,
    userId: row.user_id,
    customerName: row.customer_name,
    mobile: row.mobile,
    whatsapp: row.whatsapp,
    email: row.email,
    deliveryAddress: row.delivery_address,
    cityTownVillage: row.city_town_village,
    district: row.district,
    state: row.state,
    pincode: row.pincode,
    deliveryInstructions: row.delivery_instructions || '',
    subtotal: Number(row.subtotal),
    discountTotal: Number(row.discount_total),
    deliveryCharges: Number(row.delivery_charges),
    finalAmount: Number(row.final_amount),
    totalBp: Number(row.total_bp),
    orderStatus: row.order_status as OrderStatus,
    bpCreditStatus: row.bp_credit_status,
    bpCreditedAt: row.bp_credited_at || null,
    paymentMethod: (paymentRaw?.payment_method || 'COD') as PaymentMethod,
    paymentStatus: (paymentRaw?.payment_status || 'Pending') as PaymentStatus,
    paymentTransactionId: paymentRaw?.transaction_id || null,
    paymentDate: paymentRaw?.payment_date || null,
    refundStatus: (paymentRaw?.refund_status || 'None') as 'None' | 'Requested' | 'Refunded',
    delivery,
    items,
    statusHistory,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ==========================================
// PUBLIC CATALOG & PRODUCT QUERIES
// ==========================================
export const ecommerceDb = {
  getCategories(): ProductCategory[] {
    const rows = sqlite.prepare('SELECT * FROM product_categories ORDER BY name ASC').all() as any[];
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      subcategories: JSON.parse(r.subcategories_json || '[]'),
    }));
  },

  listProducts(filters: {
    search?: string;
    category?: string;
    subcategory?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
    includeInactive?: boolean;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const where: string[] = [];
    const params: any[] = [];

    if (!filters.includeInactive) {
      where.push('is_active = 1');
    }
    if (filters.search) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      where.push('(LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR LOWER(id) LIKE ? OR LOWER(description) LIKE ? OR LOWER(category) LIKE ?)');
      params.push(q, q, q, q, q);
    }
    if (filters.category && filters.category !== 'All') {
      where.push('category = ?');
      params.push(filters.category);
    }
    if (filters.subcategory && filters.subcategory !== 'All') {
      where.push('subcategory = ?');
      params.push(filters.subcategory);
    }
    if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
      where.push('COALESCE(discounted_price, price) >= ?');
      params.push(filters.minPrice);
    }
    if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
      where.push('COALESCE(discounted_price, price) <= ?');
      params.push(filters.maxPrice);
    }
    if (filters.featured) {
      where.push('is_featured = 1');
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';

    let orderSql = 'ORDER BY is_featured DESC, created_at DESC';
    switch (filters.sort) {
      case 'price_asc':
        orderSql = 'ORDER BY COALESCE(discounted_price, price) ASC';
        break;
      case 'price_desc':
        orderSql = 'ORDER BY COALESCE(discounted_price, price) DESC';
        break;
      case 'bp_desc':
        orderSql = 'ORDER BY bp_value DESC';
        break;
      case 'best_selling':
        orderSql = 'ORDER BY total_sold DESC';
        break;
      case 'newest':
        orderSql = 'ORDER BY created_at DESC';
        break;
    }

    const total = (sqlite.prepare(`SELECT COUNT(*) as c FROM products ${whereSql}`).get(...params) as any).c;
    const page = Math.max(1, filters.page || 1);
    const limit = Math.max(1, Math.min(100, filters.limit || 12));
    const offset = (page - 1) * limit;

    const rows = sqlite
      .prepare(`SELECT * FROM products ${whereSql} ${orderSql} LIMIT ? OFFSET ?`)
      .all(...params, limit, offset) as any[];

    return {
      products: rows.map(hydrateProduct),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  },

  getProductById(id: string): EcommerceProduct | null {
    const row = sqlite.prepare('SELECT * FROM products WHERE id = ? OR sku = ?').get(id, id) as any;
    return row ? hydrateProduct(row) : null;
  },

  // ==========================================
  // ADMIN PRODUCT CRUD
  // ==========================================
  createProduct(input: Partial<EcommerceProduct> & { name: string; price: number; bpValue: number }): EcommerceProduct {
    const ts = nowStr();
    const id = (input.id || `PRD-${Date.now().toString().slice(-6)}`).trim().toUpperCase();
    const sku = (input.sku || `WDH-SKU-${Date.now().toString().slice(-5)}`).trim().toUpperCase();
    const stockQty = Math.max(0, Math.floor(Number(input.stockQuantity) || 0));
    const avail =
      input.availabilityStatus ||
      (stockQty <= 0 ? 'out_of_stock' : stockQty < 10 ? 'limited' : 'in_stock');

    const tx = sqlite.transaction(() => {
      // Ensure category exists
      const catName = (input.category || 'Daily Essentials').trim();
      const subName = (input.subcategory || '').trim();
      const existingCat = sqlite.prepare('SELECT * FROM product_categories WHERE name = ?').get(catName) as any;
      if (!existingCat) {
        const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        sqlite
          .prepare('INSERT INTO product_categories (id, name, slug, subcategories_json, created_at) VALUES (?, ?, ?, ?, ?)')
          .run(`CAT-${Date.now()}`, catName, slug, JSON.stringify(subName ? [subName] : []), ts);
      } else if (subName) {
        const subs: string[] = JSON.parse(existingCat.subcategories_json || '[]');
        if (!subs.includes(subName)) {
          subs.push(subName);
          sqlite
            .prepare('UPDATE product_categories SET subcategories_json = ? WHERE id = ?')
            .run(JSON.stringify(subs), existingCat.id);
        }
      }

      sqlite
        .prepare(
          `INSERT INTO products (
            id, sku, name, description, category, subcategory, price, discounted_price, bp_value,
            stock_quantity, availability_status, delivery_charge, is_featured, is_active, total_sold, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
        )
        .run(
          id,
          sku,
          input.name.trim(),
          (input.description || '').trim(),
          catName,
          subName,
          Math.max(0, Number(input.price) || 0),
          input.discountedPrice !== null && input.discountedPrice !== undefined && Number(input.discountedPrice) > 0
            ? Number(input.discountedPrice)
            : null,
          Math.max(0, Math.round(Number(input.bpValue) || 0)),
          stockQty,
          avail,
          Math.max(0, Number(input.deliveryCharge) || 0),
          input.isFeatured ? 1 : 0,
          input.isActive !== false ? 1 : 0,
          ts,
          ts
        );

      const images = (input.images || []).filter(isValidImageUrl);
      const insertImg = sqlite.prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)');
      images.forEach((img, idx) => insertImg.run(id, img, idx));

      const specs = input.specifications || [];
      const insertSpec = sqlite.prepare('INSERT INTO product_specifications (product_id, spec_key, spec_value, sort_order) VALUES (?, ?, ?, ?)');
      specs.forEach((s, idx) => {
        if (s.key?.trim() && s.value?.trim()) {
          insertSpec.run(id, s.key.trim(), s.value.trim(), idx);
        }
      });

      const vars = input.variations || [];
      const insertVar = sqlite.prepare('INSERT INTO product_variations (product_id, variation_name, options_json) VALUES (?, ?, ?)');
      vars.forEach((v) => {
        if (v.name?.trim() && Array.isArray(v.options) && v.options.length > 0) {
          insertVar.run(id, v.name.trim(), JSON.stringify(v.options.map((o) => o.trim()).filter(Boolean)));
        }
      });
    });

    tx();
    return this.getProductById(id)!;
  },

  updateProduct(id: string, input: Partial<EcommerceProduct>): EcommerceProduct | null {
    const existing = this.getProductById(id);
    if (!existing) return null;

    const ts = nowStr();
    const stockQty =
      input.stockQuantity !== undefined ? Math.max(0, Math.floor(Number(input.stockQuantity))) : existing.stockQuantity;
    const avail =
      input.availabilityStatus ||
      (stockQty <= 0 ? 'out_of_stock' : stockQty < 10 ? 'limited' : 'in_stock');

    const tx = sqlite.transaction(() => {
      sqlite
        .prepare(
          `UPDATE products SET
            sku = ?, name = ?, description = ?, category = ?, subcategory = ?,
            price = ?, discounted_price = ?, bp_value = ?, stock_quantity = ?,
            availability_status = ?, delivery_charge = ?, is_featured = ?, is_active = ?, updated_at = ?
          WHERE id = ?`
        )
        .run(
          (input.sku ?? existing.sku).trim().toUpperCase(),
          (input.name ?? existing.name).trim(),
          (input.description ?? existing.description).trim(),
          (input.category ?? existing.category).trim(),
          (input.subcategory ?? existing.subcategory).trim(),
          input.price !== undefined ? Math.max(0, Number(input.price)) : existing.price,
          input.discountedPrice !== undefined
            ? input.discountedPrice !== null && Number(input.discountedPrice) > 0
              ? Number(input.discountedPrice)
              : null
            : existing.discountedPrice,
          input.bpValue !== undefined ? Math.max(0, Math.round(Number(input.bpValue))) : existing.bpValue,
          stockQty,
          avail,
          input.deliveryCharge !== undefined ? Math.max(0, Number(input.deliveryCharge)) : existing.deliveryCharge,
          input.isFeatured !== undefined ? (input.isFeatured ? 1 : 0) : existing.isFeatured ? 1 : 0,
          input.isActive !== undefined ? (input.isActive ? 1 : 0) : existing.isActive ? 1 : 0,
          ts,
          existing.id
        );

      if (input.images !== undefined) {
        sqlite.prepare('DELETE FROM product_images WHERE product_id = ?').run(existing.id);
        const insertImg = sqlite.prepare('INSERT INTO product_images (product_id, image_url, sort_order) VALUES (?, ?, ?)');
        input.images.filter(isValidImageUrl).forEach((img, idx) => insertImg.run(existing.id, img, idx));
      }

      if (input.specifications !== undefined) {
        sqlite.prepare('DELETE FROM product_specifications WHERE product_id = ?').run(existing.id);
        const insertSpec = sqlite.prepare('INSERT INTO product_specifications (product_id, spec_key, spec_value, sort_order) VALUES (?, ?, ?, ?)');
        input.specifications.forEach((s, idx) => {
          if (s.key?.trim() && s.value?.trim()) insertSpec.run(existing.id, s.key.trim(), s.value.trim(), idx);
        });
      }

      if (input.variations !== undefined) {
        sqlite.prepare('DELETE FROM product_variations WHERE product_id = ?').run(existing.id);
        const insertVar = sqlite.prepare('INSERT INTO product_variations (product_id, variation_name, options_json) VALUES (?, ?, ?)');
        input.variations.forEach((v) => {
          if (v.name?.trim() && Array.isArray(v.options) && v.options.length > 0) {
            insertVar.run(existing.id, v.name.trim(), JSON.stringify(v.options.map((o) => o.trim()).filter(Boolean)));
          }
        });
      }
    });

    tx();
    return this.getProductById(existing.id);
  },

  deleteProduct(id: string): boolean {
    const res = sqlite.prepare('DELETE FROM products WHERE id = ?').run(id);
    return res.changes > 0;
  },

  // ==========================================
  // CART OPERATIONS
  // ==========================================
  getCart(userId: string): EcommerceCartItem[] {
    const rows = sqlite.prepare('SELECT * FROM cart_items WHERE user_id = ? ORDER BY updated_at DESC').all(userId) as any[];
    const result: EcommerceCartItem[] = [];
    for (const r of rows) {
      const product = this.getProductById(r.product_id);
      if (product && product.isActive) {
        result.push({
          id: r.id,
          userId: r.user_id,
          productId: r.product_id,
          quantity: Number(r.quantity),
          selectedVariations: JSON.parse(r.selected_variations_json || '{}'),
          product,
        });
      }
    }
    return result;
  },

  addToCart(userId: string, productId: string, quantity: number, selectedVariations: Record<string, string> = {}) {
    const product = this.getProductById(productId);
    if (!product || !product.isActive) {
      return { success: false, error: 'Product is not available.' };
    }
    if (product.stockQuantity <= 0 || product.availabilityStatus === 'out_of_stock') {
      return { success: false, error: 'This product is currently out of stock.' };
    }

    const qty = Math.max(1, Math.floor(Number(quantity) || 1));
    const varJson = JSON.stringify(selectedVariations || {});
    const existing = sqlite
      .prepare('SELECT * FROM cart_items WHERE user_id = ? AND product_id = ? AND selected_variations_json = ?')
      .get(userId, product.id, varJson) as any;

    const ts = nowStr();
    if (existing) {
      const newQty = Math.min(product.stockQuantity, Number(existing.quantity) + qty);
      sqlite.prepare('UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ?').run(newQty, ts, existing.id);
    } else {
      const newQty = Math.min(product.stockQuantity, qty);
      sqlite
        .prepare('INSERT INTO cart_items (id, user_id, product_id, quantity, selected_variations_json, updated_at) VALUES (?, ?, ?, ?, ?, ?)')
        .run(`CRT-${Date.now()}-${Math.floor(Math.random() * 1000)}`, userId, product.id, newQty, varJson, ts);
    }

    return { success: true, items: this.getCart(userId) };
  },

  updateCartItem(userId: string, cartItemId: string, quantity: number) {
    const item = sqlite.prepare('SELECT * FROM cart_items WHERE id = ? AND user_id = ?').get(cartItemId, userId) as any;
    if (!item) return { success: false, error: 'Cart item not found.' };

    const qty = Math.floor(Number(quantity) || 0);
    if (qty <= 0) {
      sqlite.prepare('DELETE FROM cart_items WHERE id = ? AND user_id = ?').run(cartItemId, userId);
    } else {
      const product = this.getProductById(item.product_id);
      const maxStock = product ? product.stockQuantity : qty;
      sqlite
        .prepare('UPDATE cart_items SET quantity = ?, updated_at = ? WHERE id = ? AND user_id = ?')
        .run(Math.min(maxStock, qty), nowStr(), cartItemId, userId);
    }
    return { success: true, items: this.getCart(userId) };
  },

  clearCart(userId: string) {
    sqlite.prepare('DELETE FROM cart_items WHERE user_id = ?').run(userId);
  },

  // ==========================================
  // SERVER-AUTHORITATIVE CHECKOUT & ORDERS
  // ==========================================
  createOrder(params: {
    userId: string;
    customerName: string;
    mobile: string;
    whatsapp?: string;
    email?: string;
    deliveryAddress: string;
    cityTownVillage: string;
    district: string;
    state: string;
    pincode: string;
    deliveryInstructions?: string;
    paymentMethod: PaymentMethod;
    items: Array<{ productId: string; quantity: number; selectedVariations?: Record<string, string> }>;
  }): { success: boolean; order?: EcommerceOrder; error?: string } {
    if (!params.items || params.items.length === 0) {
      return { success: false, error: 'Your shopping cart is empty.' };
    }

    const user = coreDb.findUserById(params.userId);
    if (!user) {
      return { success: false, error: `Registered LOGIN ID "${params.userId}" does not exist.` };
    }

    const ts = nowStr();
    const orderId = `ORD-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

    try {
      const createdOrder = sqlite.transaction(() => {
        let subtotal = 0;
        let discountTotal = 0;
        let deliveryCharges = 0;
        let totalBp = 0;

        const preparedItems: Array<{
          product: EcommerceProduct;
          qty: number;
          effectiveUnitPrice: number;
          lineTotal: number;
          lineBp: number;
          selectedVariations: Record<string, string>;
        }> = [];

        for (const reqItem of params.items) {
          const qty = Math.floor(Number(reqItem.quantity) || 0);
          if (qty <= 0) {
            throw new Error('Item quantity must be at least 1.');
          }
          const prodRow = sqlite.prepare('SELECT * FROM products WHERE id = ?').get(reqItem.productId) as any;
          if (!prodRow || !prodRow.is_active) {
            throw new Error(`Product ${reqItem.productId} is unavailable.`);
          }
          const prod = hydrateProduct(prodRow);
          if (prod.stockQuantity < qty || prod.availabilityStatus === 'out_of_stock') {
            throw new Error(`Insufficient stock for "${prod.name}" (Available: ${prod.stockQuantity}).`);
          }

          const effectivePrice =
            prod.discountedPrice !== null && prod.discountedPrice > 0 && prod.discountedPrice < prod.price
              ? prod.discountedPrice
              : prod.price;

          const lineMrp = prod.price * qty;
          const lineTotal = effectivePrice * qty;
          const lineDiscount = Math.max(0, lineMrp - lineTotal);
          const lineBp = prod.bpValue * qty;

          subtotal += lineMrp;
          discountTotal += lineDiscount;
          totalBp += lineBp;
          // Max delivery charge across items (or sum if specific product delivery fee applies; here max avoids overcharging)
          if (prod.deliveryCharge > deliveryCharges) {
            deliveryCharges = prod.deliveryCharge;
          }

          preparedItems.push({
            product: prod,
            qty,
            effectiveUnitPrice: effectivePrice,
            lineTotal,
            lineBp,
            selectedVariations: reqItem.selectedVariations || {},
          });
        }

        const finalAmount = Math.max(0, subtotal - discountTotal + deliveryCharges);

        // Save/update customer snapshot
        sqlite
          .prepare(
            `INSERT INTO customers (
              user_id, full_name, mobile, whatsapp, email, delivery_address,
              city_town_village, district, state, pincode, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              full_name = excluded.full_name,
              mobile = excluded.mobile,
              whatsapp = excluded.whatsapp,
              email = excluded.email,
              delivery_address = excluded.delivery_address,
              city_town_village = excluded.city_town_village,
              district = excluded.district,
              state = excluded.state,
              pincode = excluded.pincode,
              updated_at = excluded.updated_at`
          )
          .run(
            user.id,
            params.customerName.trim(),
            params.mobile.trim(),
            (params.whatsapp || params.mobile).trim(),
            (params.email || user.email).trim(),
            params.deliveryAddress.trim(),
            params.cityTownVillage.trim(),
            params.district.trim(),
            params.state.trim(),
            params.pincode.trim(),
            ts
          );

        // Insert Order (Always starts as Pending; BP is NEVER credited at order creation before verification)
        sqlite
          .prepare(
            `INSERT INTO orders (
              id, user_id, customer_name, mobile, whatsapp, email, delivery_address,
              city_town_village, district, state, pincode, delivery_instructions,
              subtotal, discount_total, delivery_charges, final_amount, total_bp,
              order_status, bp_credit_status, bp_credited_at, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', 'Pending', NULL, ?, ?)`
          )
          .run(
            orderId,
            user.id,
            params.customerName.trim(),
            params.mobile.trim(),
            (params.whatsapp || params.mobile).trim(),
            (params.email || user.email).trim(),
            params.deliveryAddress.trim(),
            params.cityTownVillage.trim(),
            params.district.trim(),
            params.state.trim(),
            params.pincode.trim(),
            (params.deliveryInstructions || '').trim(),
            subtotal,
            discountTotal,
            deliveryCharges,
            finalAmount,
            totalBp,
            ts,
            ts
          );

        const insertItem = sqlite.prepare(`
          INSERT INTO order_items (
            id, order_id, product_id, product_sku, product_name, product_image,
            unit_price, unit_discounted_price, effective_unit_price, unit_bp,
            quantity, line_total, line_bp, selected_variations_json
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const decStock = sqlite.prepare(`
          UPDATE products SET
            stock_quantity = stock_quantity - ?,
            total_sold = total_sold + ?,
            availability_status = CASE WHEN stock_quantity - ? <= 0 THEN 'out_of_stock' WHEN stock_quantity - ? < 10 THEN 'limited' ELSE 'in_stock' END,
            updated_at = ?
          WHERE id = ?
        `);

        preparedItems.forEach((it, idx) => {
          insertItem.run(
            `OITM-${orderId.slice(-6)}-${idx + 1}`,
            orderId,
            it.product.id,
            it.product.sku,
            it.product.name,
            it.product.images[0] || '',
            it.product.price,
            it.product.discountedPrice,
            it.effectiveUnitPrice,
            it.product.bpValue,
            it.qty,
            it.lineTotal,
            it.lineBp,
            JSON.stringify(it.selectedVariations)
          );
          decStock.run(it.qty, it.qty, it.qty, it.qty, ts, it.product.id);
        });

        sqlite
          .prepare(
            `INSERT INTO payments (id, order_id, payment_method, payment_status, amount, refund_status, updated_at)
             VALUES (?, ?, ?, 'Pending', ?, 'None', ?)`
          )
          .run(`PAY-${Date.now()}`, orderId, params.paymentMethod || 'COD', finalAmount, ts);

        sqlite
          .prepare(
            `INSERT INTO deliveries (id, order_id, delivery_charges, delivery_status, notes, updated_at)
             VALUES (?, ?, ?, 'Pending', ?, ?)`
          )
          .run(`DEL-${Date.now()}`, orderId, deliveryCharges, 'Order received. Awaiting confirmation.', ts);

        sqlite
          .prepare(`INSERT INTO order_status_history (id, order_id, status, note, updated_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
          .run(
            `OSH-${Date.now()}`,
            orderId,
            'Pending',
            `Order placed (${params.paymentMethod}). ${totalBp} BP queued for LOGIN ID ${user.id} upon confirmation/delivery.`,
            user.id,
            ts
          );

        // Clear user's cart
        sqlite.prepare('DELETE FROM cart_items WHERE user_id = ?').run(user.id);

        return this.getOrderById(orderId)!;
      })();

      return { success: true, order: createdOrder };
    } catch (e: any) {
      return { success: false, error: e.message || 'Failed to create order.' };
    }
  },

  getOrderById(orderId: string): EcommerceOrder | null {
    const row = sqlite.prepare('SELECT * FROM orders WHERE LOWER(id) = LOWER(?)').get(orderId.trim()) as any;
    return row ? hydrateOrder(row) : null;
  },

  getOrdersForUser(userId: string): EcommerceOrder[] {
    const rows = sqlite
      .prepare('SELECT * FROM orders WHERE LOWER(user_id) = LOWER(?) ORDER BY created_at DESC')
      .all(userId) as any[];
    return rows.map(hydrateOrder);
  },

  listAdminOrders(filters: { search?: string; status?: string; dateFrom?: string; dateTo?: string }): EcommerceOrder[] {
    const where: string[] = [];
    const params: any[] = [];

    if (filters.search) {
      const q = `%${filters.search.trim().toLowerCase()}%`;
      where.push('(LOWER(id) LIKE ? OR LOWER(user_id) LIKE ? OR LOWER(customer_name) LIKE ? OR mobile LIKE ?)');
      params.push(q, q, q, q);
    }
    if (filters.status && filters.status !== 'All') {
      where.push('order_status = ?');
      params.push(filters.status);
    }
    if (filters.dateFrom) {
      where.push('substr(created_at, 1, 10) >= ?');
      params.push(filters.dateFrom);
    }
    if (filters.dateTo) {
      where.push('substr(created_at, 1, 10) <= ?');
      params.push(filters.dateTo);
    }

    const whereSql = where.length > 0 ? `WHERE ${where.join(' AND ')}` : '';
    const rows = sqlite.prepare(`SELECT * FROM orders ${whereSql} ORDER BY created_at DESC`).all(...params) as any[];
    return rows.map(hydrateOrder);
  },

  // ==========================================
  // ATOMIC BP CREDIT & REVERSAL ENGINE
  // ==========================================
  creditBpForOrderInternal(order: EcommerceOrder, actorId: string) {
    if (order.totalBp <= 0) return;

    // Check if already credited (also enforced by unique DB index)
    const existingCredit = sqlite
      .prepare(`SELECT id FROM bp_transactions WHERE order_id = ? AND type = 'credit'`)
      .get(order.id) as any;
    if (existingCredit) {
      return;
    }

    const ts = nowStr();
    const existingWallet = sqlite.prepare('SELECT * FROM bp_wallets WHERE user_id = ?').get(order.userId) as any;
    const currentBal = existingWallet ? Number(existingWallet.bp_balance) : 0;
    const newBal = currentBal + order.totalBp;
    const totalEarned = (existingWallet ? Number(existingWallet.total_earned) : 0) + order.totalBp;

    sqlite
      .prepare(
        `INSERT INTO bp_wallets (user_id, bp_balance, total_earned, total_reversed, updated_at)
         VALUES (?, ?, ?, 0, ?)
         ON CONFLICT(user_id) DO UPDATE SET
           bp_balance = excluded.bp_balance,
           total_earned = excluded.total_earned,
           updated_at = excluded.updated_at`
      )
      .run(order.userId, newBal, totalEarned, ts);

    const itemsSummary = order.items
      .map((i) => `${i.quantity}x ${i.productName} (₹${i.effectiveUnitPrice} | ${i.unitBp} BP)`)
      .join(', ');

    sqlite
      .prepare(
        `INSERT INTO bp_transactions (
          id, user_id, order_id, type, bp_amount, balance_after, status, description, items_summary, created_by, created_at
        ) VALUES (?, ?, ?, 'credit', ?, ?, 'credited', ?, ?, ?, ?)`
      )
      .run(
        `BPTX-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        order.userId,
        order.id,
        order.totalBp,
        newBal,
        `Automatic BP Credit for qualifying order ${order.id}`,
        itemsSummary,
        actorId,
        ts
      );

    sqlite
      .prepare(`UPDATE orders SET bp_credit_status = 'Credited', bp_credited_at = ?, updated_at = ? WHERE id = ?`)
      .run(ts, ts, order.id);

    coreDb.addAuditLog(
      actorId,
      actorId,
      'BP_CREDITED',
      `Credited +${order.totalBp} BP to LOGIN ID ${order.userId} for Order ${order.id}`
    );
  },

  reverseBpForOrderInternal(order: EcommerceOrder, actorId: string, reason: string) {
    const ts = nowStr();
    const existingCredit = sqlite
      .prepare(`SELECT * FROM bp_transactions WHERE order_id = ? AND type = 'credit'`)
      .get(order.id) as any;

    if (!existingCredit) {
      // Never credited -> simply mark Cancelled
      sqlite
        .prepare(`UPDATE orders SET bp_credit_status = 'Cancelled', updated_at = ? WHERE id = ?`)
        .run(ts, order.id);
      return;
    }

    const existingReversal = sqlite
      .prepare(`SELECT id FROM bp_transactions WHERE order_id = ? AND type = 'reversal'`)
      .get(order.id) as any;
    if (existingReversal) {
      return; // Already reversed once
    }

    const wallet = sqlite.prepare('SELECT * FROM bp_wallets WHERE user_id = ?').get(order.userId) as any;
    const currentBal = wallet ? Number(wallet.bp_balance) : 0;
    const reverseAmount = Number(existingCredit.bp_amount);
    const newBal = Math.max(0, currentBal - reverseAmount);
    const totalReversed = (wallet ? Number(wallet.total_reversed) : 0) + reverseAmount;

    sqlite
      .prepare(
        `UPDATE bp_wallets SET bp_balance = ?, total_reversed = ?, updated_at = ? WHERE user_id = ?`
      )
      .run(newBal, totalReversed, ts, order.userId);

    sqlite
      .prepare(
        `INSERT INTO bp_transactions (
          id, user_id, order_id, type, bp_amount, balance_after, status, description, items_summary, created_by, created_at
        ) VALUES (?, ?, ?, 'reversal', ?, ?, 'reversed', ?, ?, ?, ?)`
      )
      .run(
        `BPTX-REV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        order.userId,
        order.id,
        -reverseAmount,
        newBal,
        `BP Reversed (${reason}) for Order ${order.id}`,
        existingCredit.items_summary || '',
        actorId,
        ts
      );

    sqlite
      .prepare(`UPDATE orders SET bp_credit_status = 'Reversed', updated_at = ? WHERE id = ?`)
      .run(ts, order.id);

    coreDb.addAuditLog(
      actorId,
      actorId,
      'BP_REVERSED',
      `Reversed -${reverseAmount} BP from LOGIN ID ${order.userId} for Order ${order.id} (${reason})`
    );
  },

  restoreStockForOrderInternal(order: EcommerceOrder) {
    const ts = nowStr();
    const restoreStmt = sqlite.prepare(`
      UPDATE products SET
        stock_quantity = stock_quantity + ?,
        total_sold = MAX(0, total_sold - ?),
        availability_status = CASE WHEN stock_quantity + ? <= 0 THEN 'out_of_stock' WHEN stock_quantity + ? < 10 THEN 'limited' ELSE 'in_stock' END,
        updated_at = ?
      WHERE id = ?
    `);
    for (const item of order.items) {
      restoreStmt.run(item.quantity, item.quantity, item.quantity, item.quantity, ts, item.productId);
    }
  },

  /**
   * Transitions order status and enforces automatic single-time BP credit & reversal rules:
   * - Pending: NEVER credits BP.
   * - Confirmed / Processing / Packed / Shipped / Out for Delivery: Credits BP automatically if Payment is Paid.
   * - Delivered: Marks COD payment as Paid (collected on delivery) and Credits BP automatically once!
   * - Cancelled / Returned: Reverses BP (if credited) and restores inventory if transitioning from active status.
   */
  updateOrderStatus(orderId: string, newStatus: OrderStatus, note: string, adminId: string): { success: boolean; order?: EcommerceOrder; error?: string } {
    const existing = this.getOrderById(orderId);
    if (!existing) return { success: false, error: 'Order not found.' };

    const ts = nowStr();
    const wasInactive = existing.orderStatus === 'Cancelled' || existing.orderStatus === 'Returned';
    const isNowInactive = newStatus === 'Cancelled' || newStatus === 'Returned';

    const tx = sqlite.transaction(() => {
      sqlite.prepare('UPDATE orders SET order_status = ?, updated_at = ? WHERE id = ?').run(newStatus, ts, existing.id);

      // Sync delivery_status automatically for convenience
      const mappedDeliveryStatus: Record<OrderStatus, DeliveryStatus> = {
        Pending: 'Pending',
        Confirmed: 'Pending',
        Processing: 'Pending',
        Packed: 'Packed',
        Shipped: 'Shipped',
        'Out for Delivery': 'Out for Delivery',
        Delivered: 'Delivered',
        Cancelled: 'Cancelled',
        Returned: 'Returned',
      };
      sqlite
        .prepare('UPDATE deliveries SET delivery_status = ?, updated_at = ? WHERE order_id = ?')
        .run(mappedDeliveryStatus[newStatus], ts, existing.id);

      // If Delivered via COD and still Pending payment, mark COD Collected/Paid
      if (newStatus === 'Delivered' && existing.paymentMethod === 'COD' && existing.paymentStatus === 'Pending') {
        sqlite
          .prepare(`UPDATE payments SET payment_status = 'Paid', transaction_id = COALESCE(transaction_id, ?), payment_date = COALESCE(payment_date, ?), updated_at = ? WHERE order_id = ?`)
          .run(`COD-${existing.id}`, ts, ts, existing.id);
      }

      sqlite
        .prepare(`INSERT INTO order_status_history (id, order_id, status, note, updated_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
        .run(`OSH-${Date.now()}-${Math.floor(Math.random() * 1000)}`, existing.id, newStatus, note || `Order status updated to ${newStatus}`, adminId, ts);

      const refreshed = this.getOrderById(existing.id)!;

      if (isNowInactive) {
        if (!wasInactive) {
          this.restoreStockForOrderInternal(refreshed);
        }
        this.reverseBpForOrderInternal(refreshed, adminId, `Order ${newStatus}`);
      } else if (newStatus !== 'Pending') {
        const qualifyingPaid = refreshed.paymentStatus === 'Paid';
        if (qualifyingPaid || newStatus === 'Delivered') {
          this.creditBpForOrderInternal(refreshed, adminId);
        }
      }

      return this.getOrderById(existing.id)!;
    });

    const updated = tx();
    return { success: true, order: updated };
  },

  updateDeliveryDetails(
    orderId: string,
    updates: Partial<OrderDeliveryInfo>,
    adminId: string
  ): { success: boolean; order?: EcommerceOrder; error?: string } {
    const existing = this.getOrderById(orderId);
    if (!existing) return { success: false, error: 'Order not found.' };
    if (updates.trackingUrl !== undefined && !isValidHttpUrl(updates.trackingUrl)) {
      return { success: false, error: 'Tracking URL must start with http:// or https://' };
    }

    const ts = nowStr();
    const tx = sqlite.transaction(() => {
      const delCharge = updates.deliveryCharges !== undefined ? Math.max(0, Number(updates.deliveryCharges)) : existing.delivery.deliveryCharges;

      sqlite
        .prepare(
          `UPDATE deliveries SET
            partner_name = ?, tracking_number = ?, shipment_date = ?,
            estimated_delivery_date = ?, delivery_charges = ?, tracking_url = ?,
            delivery_status = ?, notes = ?, updated_at = ?
          WHERE order_id = ?`
        )
        .run(
          (updates.partnerName ?? existing.delivery.partnerName).trim(),
          (updates.trackingNumber ?? existing.delivery.trackingNumber).trim(),
          (updates.shipmentDate ?? existing.delivery.shipmentDate).trim(),
          (updates.estimatedDeliveryDate ?? existing.delivery.estimatedDeliveryDate).trim(),
          delCharge,
          (updates.trackingUrl ?? existing.delivery.trackingUrl).trim(),
          updates.deliveryStatus ?? existing.delivery.deliveryStatus,
          (updates.notes ?? existing.delivery.notes).trim(),
          ts,
          existing.id
        );

      // Update order delivery charges & final amount if changed
      if (updates.deliveryCharges !== undefined && delCharge !== existing.deliveryCharges) {
        const newFinal = Math.max(0, existing.subtotal - existing.discountTotal + delCharge);
        sqlite
          .prepare('UPDATE orders SET delivery_charges = ?, final_amount = ?, updated_at = ? WHERE id = ?')
          .run(delCharge, newFinal, ts, existing.id);
        sqlite.prepare('UPDATE payments SET amount = ?, updated_at = ? WHERE order_id = ?').run(newFinal, ts, existing.id);
      }

      if (updates.deliveryStatus) {
        sqlite
          .prepare(`INSERT INTO order_status_history (id, order_id, status, note, updated_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
          .run(
            `OSH-${Date.now()}`,
            existing.id,
            `Delivery: ${updates.deliveryStatus}`,
            updates.notes || `Delivery updated (${updates.partnerName || existing.delivery.partnerName || 'Courier'})`,
            adminId,
            ts
          );
      }
    });

    tx();
    return { success: true, order: this.getOrderById(existing.id)! };
  },

  updatePaymentDetails(
    orderId: string,
    updates: {
      paymentStatus?: PaymentStatus;
      transactionId?: string;
      gatewayOrderId?: string;
      paymentDate?: string;
      refundStatus?: 'None' | 'Requested' | 'Refunded';
      refundNotes?: string;
    },
    actorId: string
  ): { success: boolean; order?: EcommerceOrder; error?: string } {
    const existing = this.getOrderById(orderId);
    if (!existing) return { success: false, error: 'Order not found.' };

    const ts = nowStr();
    const tx = sqlite.transaction(() => {
      const nextPayStatus = updates.paymentStatus ?? existing.paymentStatus;
      const nextRefundStatus = updates.refundStatus ?? existing.refundStatus;

      sqlite
        .prepare(
          `UPDATE payments SET
            payment_status = ?, transaction_id = COALESCE(?, transaction_id),
            gateway_order_id = COALESCE(?, gateway_order_id),
            payment_date = COALESCE(?, payment_date),
            refund_status = ?, refund_notes = COALESCE(?, refund_notes), updated_at = ?
          WHERE order_id = ?`
        )
        .run(
          nextPayStatus,
          updates.transactionId ?? null,
          updates.gatewayOrderId ?? null,
          updates.paymentDate ?? (nextPayStatus === 'Paid' && !existing.paymentDate ? ts : null),
          nextRefundStatus,
          updates.refundNotes ?? null,
          ts,
          existing.id
        );

      const refreshed = this.getOrderById(existing.id)!;

      // If Refunded or Failed payment -> reverse any credited BP
      if (nextRefundStatus === 'Refunded' || nextPayStatus === 'Refunded' || nextPayStatus === 'Failed') {
        this.reverseBpForOrderInternal(refreshed, actorId, `Payment ${nextPayStatus} / Refunded`);
      } else if (
        nextPayStatus === 'Paid' &&
        refreshed.orderStatus !== 'Pending' &&
        refreshed.orderStatus !== 'Cancelled' &&
        refreshed.orderStatus !== 'Returned'
      ) {
        // Paid + Confirmed or higher -> automatically credit BP once
        this.creditBpForOrderInternal(refreshed, actorId);
      }
    });

    tx();
    return { success: true, order: this.getOrderById(existing.id)! };
  },

  verifyOnlinePaymentAndConfirmOrder(
    orderId: string,
    gatewayOrderId: string,
    paymentId: string,
    userId: string
  ): { success: boolean; order?: EcommerceOrder; error?: string } {
    const existing = this.getOrderById(orderId);
    if (!existing) return { success: false, error: 'Order not found.' };

    const ts = nowStr();
    const tx = sqlite.transaction(() => {
      sqlite
        .prepare(
          `UPDATE payments SET
            payment_method = 'ONLINE_RAZORPAY', payment_status = 'Paid',
            transaction_id = ?, gateway_order_id = ?, payment_date = ?, updated_at = ?
          WHERE order_id = ?`
        )
        .run(paymentId, gatewayOrderId, ts, ts, existing.id);

      if (existing.orderStatus === 'Pending') {
        sqlite.prepare(`UPDATE orders SET order_status = 'Confirmed', updated_at = ? WHERE id = ?`).run(ts, existing.id);
        sqlite
          .prepare(`INSERT INTO order_status_history (id, order_id, status, note, updated_by, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
          .run(`OSH-${Date.now()}`, existing.id, 'Confirmed', `Online payment verified (TXN: ${paymentId})`, userId, ts);
      }

      const refreshed = this.getOrderById(existing.id)!;
      this.creditBpForOrderInternal(refreshed, 'PAYMENT_GATEWAY');
    });

    tx();
    return { success: true, order: this.getOrderById(existing.id)! };
  },

  // ==========================================
  // BP WALLET QUERIES (STRICTLY USER-SCOPED)
  // ==========================================
  getUserBpWallet(userId: string): BpWalletSummary {
    const wallet = sqlite.prepare('SELECT * FROM bp_wallets WHERE LOWER(user_id) = LOWER(?)').get(userId) as any;
    const txRows = sqlite
      .prepare('SELECT * FROM bp_transactions WHERE LOWER(user_id) = LOWER(?) ORDER BY created_at DESC, rowid DESC')
      .all(userId) as any[];

    const pendingRow = sqlite
      .prepare(
        `SELECT COALESCE(SUM(total_bp), 0) as pending_bp
         FROM orders
         WHERE LOWER(user_id) = LOWER(?)
           AND bp_credit_status = 'Pending'
           AND order_status NOT IN ('Cancelled', 'Returned')`
      )
      .get(userId) as any;

    const user = coreDb.findUserById(userId);
    const transactions: BpTransaction[] = txRows.map((t) => ({
      id: t.id,
      userId: t.user_id,
      userName: user?.name || t.user_id,
      orderId: t.order_id,
      type: t.type,
      bpAmount: Number(t.bp_amount),
      balanceAfter: Number(t.balance_after),
      status: t.status,
      description: t.description,
      itemsSummary: t.items_summary || '',
      createdBy: t.created_by,
      createdAt: t.created_at,
    }));

    return {
      userId: user?.id || userId,
      totalBpBalance: wallet ? Number(wallet.bp_balance) : 0,
      totalBpEarned: wallet ? Number(wallet.total_earned) : 0,
      totalBpReversed: wallet ? Number(wallet.total_reversed) : 0,
      pendingOrderBp: Number(pendingRow?.pending_bp || 0),
      transactions,
    };
  },

  getAllBpTransactions(): BpTransaction[] {
    const txRows = sqlite.prepare('SELECT * FROM bp_transactions ORDER BY created_at DESC, rowid DESC').all() as any[];
    return txRows.map((t) => {
      const u = coreDb.findUserById(t.user_id);
      return {
        id: t.id,
        userId: t.user_id,
        userName: u?.name || t.user_id,
        orderId: t.order_id,
        type: t.type,
        bpAmount: Number(t.bp_amount),
        balanceAfter: Number(t.balance_after),
        status: t.status,
        description: t.description,
        itemsSummary: t.items_summary || '',
        createdBy: t.created_by,
        createdAt: t.created_at,
      };
    });
  },

  // ==========================================
  // ADMIN E-COMMERCE DASHBOARD SUMMARY
  // ==========================================
  getAdminSummary(): EcommerceAdminSummary {
    const prodStats = sqlite
      .prepare(
        `SELECT
          COUNT(*) as totalProducts,
          SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as activeProducts,
          SUM(CASE WHEN stock_quantity <= 0 OR availability_status = 'out_of_stock' THEN 1 ELSE 0 END) as outOfStockProducts
         FROM products`
      )
      .get() as any;

    const orderStats = sqlite
      .prepare(
        `SELECT
          COUNT(*) as totalOrders,
          SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
          SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as deliveredOrders,
          COALESCE(SUM(CASE WHEN order_status NOT IN ('Cancelled', 'Returned') THEN final_amount ELSE 0 END), 0) as totalSales,
          COALESCE(SUM(CASE WHEN bp_credit_status = 'Credited' THEN total_bp ELSE 0 END), 0) as totalBpCredited,
          COALESCE(SUM(CASE WHEN bp_credit_status = 'Pending' AND order_status NOT IN ('Cancelled', 'Returned') THEN total_bp ELSE 0 END), 0) as pendingBp
         FROM orders`
      )
      .get() as any;

    const recentRows = sqlite.prepare('SELECT * FROM orders ORDER BY created_at DESC LIMIT 6').all() as any[];
    const bestRows = sqlite.prepare('SELECT * FROM products ORDER BY total_sold DESC LIMIT 5').all() as any[];

    return {
      totalProducts: Number(prodStats.totalProducts || 0),
      activeProducts: Number(prodStats.activeProducts || 0),
      outOfStockProducts: Number(prodStats.outOfStockProducts || 0),
      totalOrders: Number(orderStats.totalOrders || 0),
      pendingOrders: Number(orderStats.pendingOrders || 0),
      deliveredOrders: Number(orderStats.deliveredOrders || 0),
      totalSales: Number(orderStats.totalSales || 0),
      totalBpCredited: Number(orderStats.totalBpCredited || 0),
      pendingBp: Number(orderStats.pendingBp || 0),
      recentOrders: recentRows.map(hydrateOrder),
      bestSellingProducts: bestRows.map(hydrateProduct),
    };
  },

  // ==========================================
  // SANITIZED DATABASE BACKUP EXPORT (NO PII / NO SECRETS)
  // ==========================================
  getSanitizedBackupData() {
    const schemaRows = sqlite
      .prepare(
        `SELECT type, name, sql FROM sqlite_master
         WHERE sql IS NOT NULL AND name NOT LIKE 'sqlite_%'
         ORDER BY CASE type WHEN 'table' THEN 0 ELSE 1 END, name ASC`
      )
      .all() as Array<{ type: string; name: string; sql: string }>;

    const schemaSqlLines: string[] = [
      '-- Watch Video, Dream in Hand Direct Selling Pvt. Ltd.',
      '-- SQLite E-Commerce & BP System Schema Export',
      `-- Exported At: ${new Date().toISOString()}`,
      '-- Note: Personal customer data, passwords, tokens, and payment credentials are excluded for security.',
      '',
    ];

    for (const row of schemaRows) {
      schemaSqlLines.push(`-- ${row.type.toUpperCase()}: ${row.name}`);
      schemaSqlLines.push(`${row.sql};`);
      schemaSqlLines.push('');
    }

    const categories = this.getCategories();
    const products = this.listProducts({ includeInactive: true });

    const aggregateOrders = sqlite
      .prepare(
        `SELECT
          COUNT(*) as totalOrders,
          SUM(CASE WHEN order_status = 'Delivered' THEN 1 ELSE 0 END) as deliveredOrders,
          SUM(CASE WHEN order_status = 'Pending' THEN 1 ELSE 0 END) as pendingOrders,
          SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) as cancelledOrders,
          SUM(CASE WHEN order_status = 'Returned' THEN 1 ELSE 0 END) as returnedOrders,
          COALESCE(SUM(CASE WHEN bp_credit_status = 'Credited' THEN total_bp ELSE 0 END), 0) as totalBpCredited
         FROM orders`
      )
      .get() as any;

    return {
      schemaSql: schemaSqlLines.join('\n'),
      categories,
      products,
      aggregateStats: {
        totalCategories: categories.length,
        totalProducts: products.length,
        totalOrders: Number(aggregateOrders?.totalOrders || 0),
        deliveredOrders: Number(aggregateOrders?.deliveredOrders || 0),
        pendingOrders: Number(aggregateOrders?.pendingOrders || 0),
        cancelledOrders: Number(aggregateOrders?.cancelledOrders || 0),
        returnedOrders: Number(aggregateOrders?.returnedOrders || 0),
        totalBpCredited: Number(aggregateOrders?.totalBpCredited || 0),
      },
    };
  },
};
