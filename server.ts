import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { WebSocketServer, WebSocket } from 'ws';
import Database from 'better-sqlite3';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import productsRouter from './routes/products.js';
import suppliersRouter from './routes/suppliers.js';
import supplyOrdersRouter from './routes/supply_orders.js';
import usersRouter from './routes/users.js';
import adminsRouter from './routes/admins.js';
import ordersRouter from './routes/orders.js';
import authRouter from './routes/auth.js';
import socialRouter from './routes/social.js';
import userStatsRouter from './routes/user_stats.js';
import miscRouter from './routes/misc.js';
import userRouter from './routes/user.js';
import uploadRouter from './routes/upload.js';
import tagsRouter from './routes/tags.js';
import categoriesRouter from './routes/categories.js';
import aiRouter from './routes/ai.js';
import reviewsRouter from './routes/reviews.js';
import referralsRouter, { generateReferralCode } from './routes/referrals.js';
import { initReferralLedgerTable } from './routes/referralBlockchain.js';
import bundlesRouter, { initBundlesTable } from './routes/bundles.js';
import marketingRouter, { initMarketingTables } from './routes/marketing.js';

const __filename_resolved = typeof __filename !== 'undefined' ? __filename : '';
const __dirname_resolved = typeof __dirname !== 'undefined' ? __dirname : path.dirname(__filename_resolved);

// Robustly load .env from multiple possible directory paths (cwd, current module dir, parents) to cover all start methods
dotenv.config();
try {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
  dotenv.config({ path: path.resolve(__dirname_resolved, '.env') });
  dotenv.config({ path: path.resolve(__dirname_resolved, '../.env') });
  dotenv.config({ path: path.resolve(__dirname_resolved, '../../.env') });
} catch (e) {
  console.error('Error loading .env paths:', e);
}

// Override console.error to log to a file
const originalConsoleError = console.error;
console.error = function (...args) {
  const logArgs = args.map(arg => {
    if (typeof arg === 'object' && arg !== null) {
      try {
        return JSON.stringify(arg, null, 2);
      } catch (e) {
        return String(arg);
      }
    }
    return arg;
  });
  try {
    fs.appendFileSync('server-errors.log', new Date().toISOString() + ' ' + logArgs.join(' ') + '\n');
  } catch (e) {
    // Fallback to original console error if file is not writable
  }
  originalConsoleError.apply(console, args);
};

// SQLite Connection Wrapper
export const db: any = {};

async function initializeDatabase() {
  const localDbPath = path.join(process.cwd(), 'database.sqlite');
  const dbPath = process.env.VERCEL ? '/tmp/database.sqlite' : localDbPath;
  if (process.env.VERCEL && !fs.existsSync(dbPath) && fs.existsSync(localDbPath)) {
    try {
      fs.copyFileSync(localDbPath, dbPath);
    } catch {
      // Fallback to creating a fresh SQLite DB in /tmp
    }
  }
  
  let sqliteDb: any;
  try {
    sqliteDb = new Database(dbPath);
    // Ultra-fast Write-Ahead Logging mode for non-blocking concurrent reads & writes
    sqliteDb.pragma('journal_mode = WAL');
    sqliteDb.pragma('synchronous = NORMAL');
    sqliteDb.pragma('cache_size = -64000'); // 64MB RAM page cache
    sqliteDb.pragma('temp_store = MEMORY'); // Keep temporary tables and sorts in RAM
    sqliteDb.pragma('mmap_size = 268435456'); // 256MB zero-copy memory mapped I/O
    sqliteDb.pragma('busy_timeout = 5000'); // Prevent SQLITE_BUSY under load
    sqliteDb.pragma('auto_vacuum = INCREMENTAL');
    sqliteDb.pragma('optimize');
    console.log('Database performance pragmas configured successfully (WAL mode enabled)');
  } catch (error: any) {
    if (error && (error.code === 'SQLITE_CORRUPT' || String(error).includes('corrupt') || String(error).includes('CORRUPT'))) {
      console.warn("SQLite database is corrupted. Deleting and recreating...", error);
      try {
        if (fs.existsSync(dbPath)) {
          fs.unlinkSync(dbPath);
        }
      } catch (e) {
        console.error("Failed to delete corrupt database.sqlite file:", e);
      }
      sqliteDb = new Database(dbPath);
      sqliteDb.pragma('journal_mode = WAL');
      sqliteDb.pragma('synchronous = NORMAL');
      sqliteDb.pragma('cache_size = -64000');
      sqliteDb.pragma('temp_store = MEMORY');
      sqliteDb.pragma('mmap_size = 268435456');
      sqliteDb.pragma('busy_timeout = 5000');
    } else {
      throw error;
    }
  }
  
  const sanitizeParams = (params: any[]) => {
    return params.map(val => {
      if (val === null || val === undefined) return null;
      if (val instanceof Date) return val.toISOString();
      if (typeof val === 'boolean') return val ? 1 : 0;
      if (Array.isArray(val) || (typeof val === 'object' && val !== null)) {
        try {
          return JSON.stringify(val);
        } catch (e) {
          return String(val);
        }
      }
      return val;
    });
  };

  Object.assign(db, {
    all: async (sql: string, params: any[] = []) => {
      return sqliteDb.prepare(sql).all(...sanitizeParams(params));
    },
    get: async (sql: string, params: any[] = []) => {
      return sqliteDb.prepare(sql).get(...sanitizeParams(params));
    },
    run: async (sql: string, params: any[] = []) => {
      const info = sqliteDb.prepare(sql).run(...sanitizeParams(params));
      return { lastID: info.lastInsertRowid, changes: info.changes };
    },
    exec: async (sql: string) => {
      sqliteDb.exec(sql);
    },
    prepare: (sql: string) => sqliteDb.prepare(sql),
    pragma: (sql: string) => sqliteDb.pragma(sql)
  });

  try {
    let schema = '';
    const schemaCandidates = [
      path.join(process.cwd(), 'schema.sql'),
      path.join(__dirname_resolved, 'schema.sql'),
      path.join(__dirname_resolved, '../schema.sql')
    ];
    for (const cand of schemaCandidates) {
      if (fs.existsSync(cand)) {
        try {
          schema = fs.readFileSync(cand, 'utf8');
          console.log(`Loaded database schema from ${cand}`);
          break;
        } catch (e) {
          console.warn(`Could not read candidate schema at ${cand}:`, e);
        }
      }
    }

    if (schema) {
      const queries = schema.split(';').filter(q => q.trim() !== '');
      for (const query of queries) {
        try {
          await db.exec(query);
        } catch (queryErr) {
          // Table or column already exists, safe to continue
        }
      }
    } else {
      console.warn('schema.sql not found on disk. Initializing self-healing core tables...');
      const coreTables = [
        "CREATE TABLE IF NOT EXISTS admins (id VARCHAR(255) PRIMARY KEY, email VARCHAR(255) NOT NULL UNIQUE, password TEXT, handle TEXT NOT NULL)",
        "CREATE TABLE IF NOT EXISTS users (id VARCHAR(255) PRIMARY KEY, handle TEXT NOT NULL, email VARCHAR(255) NOT NULL UNIQUE, password TEXT, archetype TEXT, rep INT DEFAULT 0, level INT DEFAULT 1, coins INT DEFAULT 0, gems INT DEFAULT 0, status TEXT, lastLogin TEXT, totalSpent DOUBLE DEFAULT 0, loyaltyPoints INT DEFAULT 0, credit DOUBLE DEFAULT 0, profile_picture TEXT, logistics TEXT, role TEXT DEFAULT 'user', gender TEXT, referralCode TEXT, referredBy TEXT, storeCredit DOUBLE DEFAULT 0, createdAt TEXT, phone TEXT)",
        "CREATE TABLE IF NOT EXISTS products (id VARCHAR(255) PRIMARY KEY, name TEXT NOT NULL, price DOUBLE NOT NULL, originalPrice DOUBLE NOT NULL, shippingFee DOUBLE DEFAULT 0, image TEXT, category TEXT, categoryId VARCHAR(255), gender TEXT, description TEXT, details TEXT, inStock INT DEFAULT 1, isNew INT DEFAULT 0, viewers INT DEFAULT 0, stockCount INT DEFAULT 0, hypeScore INT DEFAULT 0, velocityScore INT DEFAULT 0, isHallOfFame INT DEFAULT 0, synergyPath TEXT, appeal TEXT, brand TEXT, tags TEXT, supplierId VARCHAR(255), deliveryTime TEXT, sizes TEXT, isCustom INT DEFAULT 0, priceRange TEXT, customizationFields TEXT, images TEXT, colors TEXT, colorVariants TEXT, createdAt TEXT, offeredDiscount DOUBLE DEFAULT 0, video TEXT, slug TEXT)",
        "CREATE TABLE IF NOT EXISTS categories (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, slug VARCHAR(255) UNIQUE, heroImage TEXT, inspiration TEXT)",
        "CREATE TABLE IF NOT EXISTS tags (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE)",
        "CREATE TABLE IF NOT EXISTS orders (id VARCHAR(255) PRIMARY KEY, userId VARCHAR(255), userName TEXT, items TEXT, total DOUBLE NOT NULL, status TEXT, createdAt TEXT, shippingAddress TEXT, paymentMethod TEXT, paystackReference TEXT)",
        "CREATE TABLE IF NOT EXISTS suppliers (id VARCHAR(255) PRIMARY KEY, name TEXT NOT NULL, contactEmail TEXT, password TEXT, plain_password TEXT, region TEXT, status TEXT, performanceScore INT DEFAULT 100, totalRevenueYield DOUBLE DEFAULT 0, joinedDate TEXT, commissionRate DOUBLE DEFAULT 10)",
        "CREATE TABLE IF NOT EXISTS reviews (id VARCHAR(255) PRIMARY KEY, productId VARCHAR(255) NOT NULL, userId VARCHAR(255) NOT NULL, userName TEXT, userHandle TEXT, rating INT NOT NULL, comment TEXT, fitFeedback TEXT, createdAt TEXT, likes INT DEFAULT 0, isVerifiedPurchase INT DEFAULT 0)",
        "CREATE TABLE IF NOT EXISTS refresh_tokens (id VARCHAR(255) PRIMARY KEY, userId VARCHAR(255) NOT NULL, token TEXT NOT NULL UNIQUE, expiresAt INT NOT NULL, role TEXT, userAgent TEXT, ip TEXT)",
        "CREATE TABLE IF NOT EXISTS referrals (id VARCHAR(255) PRIMARY KEY, referrerId VARCHAR(255), refereeId VARCHAR(255), referredId VARCHAR(255), code TEXT, status TEXT, rewardAmount DOUBLE, createdAt TEXT)",
        "CREATE TABLE IF NOT EXISTS user_stats (userId VARCHAR(255) PRIMARY KEY, achievements TEXT, dailyQuests TEXT, quests TEXT, brandSubscriptions TEXT, tagSubscriptions TEXT, storeCredit DOUBLE DEFAULT 0, neuralStylistUsedToday INT DEFAULT 0)",
        "CREATE TABLE IF NOT EXISTS user_preferences (userId VARCHAR(255) PRIMARY KEY, styleProtocolCompleted INT DEFAULT 0, checkoutProtocolCompleted INT DEFAULT 0, tutorialFinished INT DEFAULT 0)"
      ];
      for (const tableSql of coreTables) {
        try {
          await db.exec(tableSql);
        } catch (tableErr) {
          console.warn("Non-fatal core table init warning:", tableErr);
        }
      }
    }

    try {
      await initMarketingTables();
    } catch (e) {
      console.warn("Early initMarketingTables warning:", e);
    }
    
    try {
      await db.exec("ALTER TABLE orders ADD COLUMN paystackReference TEXT");
      console.log("Added paystackReference to orders table");
    } catch (e) {
      // Ignored if column already exists
    }

    try {
      await db.exec("CREATE TABLE IF NOT EXISTS refresh_tokens (id VARCHAR(255) PRIMARY KEY, userId VARCHAR(255) NOT NULL, token TEXT NOT NULL UNIQUE, expiresAt INT NOT NULL, role TEXT, userAgent TEXT, ip TEXT)");
      console.log("Created refresh_tokens table");
    } catch (e) {
      console.error("Error creating refresh_tokens table:", e);
    }

    try {
      await db.exec("ALTER TABLE users ADD COLUMN gender TEXT");
      console.log("Added gender to users table");
    } catch (e) {
      // Ignored if column already exists
    }
    
    try {
      await db.exec("ALTER TABLE user_stats ADD COLUMN storeCredit DOUBLE DEFAULT 0");
      console.log("Added storeCredit to user_stats");
    } catch (e) {
      // Ignored if column already exists
    }

    try {
      await db.exec("ALTER TABLE user_stats ADD COLUMN neuralStylistUsedToday INT DEFAULT 0");
      console.log("Added neuralStylistUsedToday to user_stats");
    } catch (e) {
      // Ignored if column already exists
    }

    try {
      await db.exec("ALTER TABLE user_preferences ADD COLUMN styleProtocolCompleted INT DEFAULT 0");
      await db.exec("ALTER TABLE user_preferences ADD COLUMN checkoutProtocolCompleted INT DEFAULT 0");
      await db.exec("ALTER TABLE user_preferences ADD COLUMN tutorialFinished INT DEFAULT 0");
    } catch (e) {
      // Ignored if columns already exist
    }

    try {
      await db.exec("ALTER TABLE suppliers ADD COLUMN plain_password TEXT");
      console.log("Added plain_password to suppliers table");
    } catch (e) {
      // Ignored if column already exists
    }

    try {
      await db.exec("ALTER TABLE products ADD COLUMN video TEXT");
      console.log("Added video to products table");
    } catch (e) {
      // Ignored if column already exists
    }

    try {
      await db.exec("ALTER TABLE products ADD COLUMN slug TEXT");
      console.log("Added slug to products table");
    } catch (e) {
      // Ignored if column already exists
    }

    try {
      const prodsWithoutSlug = await db.all("SELECT id, name FROM products WHERE slug IS NULL OR slug = ''");
      for (const p of prodsWithoutSlug) {
        const slug = (p.name || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        await db.run("UPDATE products SET slug = ? WHERE id = ?", [slug, p.id]);
      }
    } catch (e) {
      // Ignored if backfill fails
    }

    try {
      await db.exec("CREATE TABLE IF NOT EXISTS tags (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE)");
      const defaultTags = [
        'All-Terrain', 'Studded', 'Classic', 'Double-Strap', 'Designer', 'Double-Band',
        'Clogs', 'Slides', 'Sandals', 'Slippers', 'Nationwide', 'Unisex'
      ];
      for (const tagName of defaultTags) {
        await db.run("INSERT OR IGNORE INTO tags (id, name) VALUES (?, ?)", [crypto.randomUUID(), tagName]);
      }
    } catch (e) {
      console.error("Error initializing tags:", e);
    }

    try {
      await db.exec("CREATE TABLE IF NOT EXISTS categories (id VARCHAR(255) PRIMARY KEY, name VARCHAR(255) NOT NULL UNIQUE, slug VARCHAR(255) UNIQUE, heroImage TEXT, inspiration TEXT)");
      try {
        await db.exec("ALTER TABLE categories ADD COLUMN slug VARCHAR(255)");
      } catch (e) {}

      const standardCategories = [
        { id: 'cat_all_terrain_clogs', name: 'All-terrain clogs', slug: 'all-terrain-clogs', heroImage: '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg', inspiration: 'ALL_TERRAIN_CLOGS' },
        { id: 'cat_studded_slides', name: 'Studded slides', slug: 'studded-slides', heroImage: '/uploads/bec/bec_studded_slides_1795581066443.jpg', inspiration: 'STUDDED_SLIDES' },
        { id: 'cat_classic_slides', name: 'Classic slides', slug: 'classic-slides', heroImage: '/uploads/bec/bec_classic_slides_1795581065464.jpg', inspiration: 'CLASSIC_SLIDES' },
        { id: 'cat_double_strap_sandals', name: 'Double-strap sandals', slug: 'double-strap-sandals', heroImage: '/uploads/bec/bec_double_strap_sandals_1795581066438.jpg', inspiration: 'DOUBLE_STRAP_SANDALS' },
        { id: 'cat_designer_clogs', name: 'Designer clogs', slug: 'designer-clogs', heroImage: '/uploads/bec/bec_designer_clogs_1795581067141.jpg', inspiration: 'DESIGNER_CLOGS' },
        { id: 'cat_double_band_slippers', name: 'Double-band slippers', slug: 'double-band-slippers', heroImage: '/uploads/bec/bec_double_band_slippers_1795581068033.jpg', inspiration: 'DOUBLE_BAND_SLIPPERS' },
      ];

      for (const cat of standardCategories) {
        const existing = await db.get("SELECT id FROM categories WHERE name = ? OR slug = ? OR id = ?", [cat.name, cat.slug, cat.id]);
        if (existing) {
          await db.run("UPDATE categories SET name = ?, slug = ?, heroImage = ?, inspiration = ? WHERE id = ?", [cat.name, cat.slug, cat.heroImage, cat.inspiration, existing.id]);
        } else {
          await db.run("INSERT INTO categories (id, name, slug, heroImage, inspiration) VALUES (?, ?, ?, ?, ?)", [cat.id, cat.name, cat.slug, cat.heroImage, cat.inspiration]);
        }
      }
      await db.exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)");
      console.log("B.E.C Footwear categories verified and synchronized");
    } catch (e) {
      console.error("Error initializing categories:", e);
    }

    try {
      await db.exec("CREATE TABLE IF NOT EXISTS paystack_transactions (id VARCHAR(255) PRIMARY KEY, email TEXT, amount DOUBLE, reference TEXT UNIQUE, status TEXT, metadata TEXT, timestamp TEXT, subaccount TEXT)");
      console.log("Created paystack_transactions table");
      
      // Migration for adding subaccount to existing
      try {
        await db.exec("ALTER TABLE paystack_transactions ADD COLUMN subaccount TEXT");
      } catch (e: any) {
        if (!e.message.includes('duplicate column name')) {
          console.error("Error adding subaccount column to paystack_transactions:", e);
        }
      }
    } catch (e) {
      console.error("Error creating paystack_transactions table:", e);
    }

    try {
      await db.exec("CREATE TABLE IF NOT EXISTS password_reset_tokens (id VARCHAR(255) PRIMARY KEY, userId VARCHAR(255) NOT NULL, token TEXT NOT NULL UNIQUE, expiresAt INT NOT NULL, used INT DEFAULT 0)");
      console.log("Created password_reset_tokens table");
    } catch (e) {
      console.error("Error creating password_reset_tokens table:", e);
    }

    try {
      await db.exec(`CREATE TABLE IF NOT EXISTS custom_requests (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        userHandle VARCHAR(255),
        email VARCHAR(255),
        itemName VARCHAR(255) NOT NULL,
        category VARCHAR(255),
        budget DOUBLE,
        description TEXT,
        referenceImage TEXT,
        status VARCHAR(50) DEFAULT 'PENDING',
        timestamp TEXT,
        adminNotes TEXT
      )`);
      console.log("Created custom_requests table");
    } catch (e) {
      console.error("Error creating custom_requests table:", e);
    }

    try {
      await db.exec("CREATE TABLE IF NOT EXISTS outfits (id VARCHAR(255) PRIMARY KEY, userId VARCHAR(255), name TEXT, items TEXT, timestamp TEXT)");
      console.log("Created outfits table");
    } catch (e) {
      console.error("Error creating outfits table:", e);
    }

    try {
      await db.exec(`CREATE TABLE IF NOT EXISTS group_messages (
        id VARCHAR(255) PRIMARY KEY,
        userId VARCHAR(255),
        userHandle VARCHAR(255),
        text TEXT,
        imageUrl TEXT,
        timestamp TEXT,
        reports INT DEFAULT 0
      )`);
      try {
        await db.exec('ALTER TABLE group_messages ADD COLUMN imageUrl TEXT');
      } catch (e) {
        // column already exists
      }
      console.log("Created/verified group_messages table");
    } catch (e) {
      console.error("Error creating group_messages table:", e);
    }

    try {
      await db.exec("CREATE TABLE IF NOT EXISTS referrals (id VARCHAR(255) PRIMARY KEY, referrerId VARCHAR(255) NOT NULL, refereeId VARCHAR(255), referredId VARCHAR(255), code VARCHAR(255), status VARCHAR(255) DEFAULT 'pending', refereeOrderId VARCHAR(255), rewardAmount DOUBLE DEFAULT 20, createdAt TEXT, completedAt TEXT)");
      console.log("Created/verified referrals table");
      await initReferralLedgerTable(db);
    } catch (e) {
      console.error("Error creating referrals table or ledger:", e);
    }

    const userRefColumns = [
      "referralCode TEXT",
      "referredBy TEXT",
      "storeCredit DOUBLE DEFAULT 0",
      "createdAt TEXT"
    ];
    for (const col of userRefColumns) {
      try {
        await db.exec(`ALTER TABLE users ADD COLUMN ${col}`);
      } catch (e: any) {
        // ignore duplicate column errors
      }
    }

    const refExtraColumns = [
      "refereeId VARCHAR(255)",
      "refereeOrderId VARCHAR(255)",
      "completedAt TEXT"
    ];
    for (const col of refExtraColumns) {
      try {
        await db.exec(`ALTER TABLE referrals ADD COLUMN ${col}`);
      } catch (e: any) {
        // ignore duplicate column
      }
    }

    // Backfill missing referral codes for existing users
    try {
      const usersWithoutCode = await db.all("SELECT id, handle, email FROM users WHERE referralCode IS NULL OR referralCode = ''");
      for (const u of usersWithoutCode) {
        const code = generateReferralCode(u.handle || u.email);
        await db.run("UPDATE users SET referralCode = ? WHERE id = ?", [code, u.id]);
      }
    } catch (e) {
      console.error("Error backfilling user referral codes:", e);
    }

    try {
      await db.exec("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user'");
      console.log("Added role column to users table");
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) {
        console.error("Error adding role column:", e);
      }
    }

    try {
      await db.exec("ALTER TABLE users ADD COLUMN logistics TEXT");
      console.log("Added logistics column to users table");
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) {
        console.error("Error adding logistics column:", e);
      }
    }

    try {
      await db.exec("ALTER TABLE users ADD COLUMN phone TEXT");
      console.log("Added phone column to users table");
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) {
        console.error("Error adding phone column to users:", e);
      }
    }

    // Products table migrations
    const productColumns = [
      "categoryId VARCHAR(255)",
      "deliveryTime TEXT",
      "isCustom INT DEFAULT 0",
      "priceRange TEXT",
      "customizationFields TEXT",
      "images TEXT",
      "colors TEXT",
      "colorVariants TEXT",
      "createdAt TEXT",
      "offeredDiscount DOUBLE DEFAULT 0"
    ];
    for (const col of productColumns) {
      try {
        await db.exec(`ALTER TABLE products ADD COLUMN ${col}`);
        console.log(`Added ${col.split(' ')[0]} column to products table`);
      } catch (e: any) {
        if (e.message.includes('duplicate column name')) {
          console.log(`Column ${col.split(' ')[0]} already exists in products table`);
        } else {
          console.error(`Error adding ${col.split(' ')[0]} to products:`, e.message);
        }
      }
    }

    try {
      await db.exec("CREATE INDEX IF NOT EXISTS idx_products_categoryId ON products(categoryId)");
    } catch (e) {}

    // Remove legacy Closet Kraze apparel rows (clearing FK dependents first) and seed B.E.C Footwear catalog
    try {
      const legacyProducts = await db.all(
        `SELECT id FROM products
         WHERE id LIKE 'prod_temu_%'
            OR id IN ('prod_generic_hoodie_grey', 'prod_retro_future_trainers_2026', 'prod_acid_matrix_vest_2026', 'prod_kfam_stealth_parka_2026')
            OR image LIKE '%unsplash.com%'`
      );
      for (const lp of legacyProducts) {
        const revRows = await db.all("SELECT id FROM reviews WHERE productId = ?", [lp.id]);
        for (const r of revRows) {
          await db.run("DELETE FROM review_helpful_votes WHERE reviewId = ?", [r.id]);
          await db.run("DELETE FROM review_images WHERE reviewId = ?", [r.id]);
        }
        await db.run("DELETE FROM reviews WHERE productId = ?", [lp.id]);
        await db.run("DELETE FROM product_reviews WHERE productId = ?", [lp.id]);
        await db.run("DELETE FROM try_ons WHERE productId = ?", [lp.id]);
        await db.run("DELETE FROM price_anomalies WHERE productId = ?", [lp.id]);
        await db.run("DELETE FROM product_styling WHERE productId = ?", [lp.id]);
        await db.run("DELETE FROM products WHERE id = ?", [lp.id]);
      }

      // Remap any remaining user/custom products still pointing to legacy categories before removing legacy categories
      const legacySlugs = ['apparel', 'footwear', 'accessories', 'kits', 'fragments', 'home', 'beauty', 'shorts', 'trousers'];
      for (const ls of legacySlugs) {
        const oldCat = await db.get("SELECT id FROM categories WHERE slug = ?", [ls]);
        if (oldCat) {
          await db.run(
            "UPDATE products SET categoryId = 'cat_classic_slides', category = 'Classic slides' WHERE categoryId = ?",
            [oldCat.id]
          );
          await db.run("DELETE FROM categories WHERE id = ?", [oldCat.id]);
        }
      }

      const becProducts = [
        {
          id: 'bec_all_terrain_01',
          name: 'Khaki & Crimson Strap All-Terrain Clogs',
          slug: 'khaki-crimson-strap-all-terrain-clogs',
          price: 380,
          originalPrice: 460,
          shippingFee: 30,
          image: '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg',
          category: 'All-terrain clogs',
          categoryId: 'cat_all_terrain_clogs',
          gender: 'UNISEX',
          description: 'Molded khaki EVA all-terrain clogs with a bold red and navy woven heel strap and rugged lugged grip outsole for city streets and trails.',
          details: JSON.stringify(['High-density molded EVA shell', 'Adjustable red & navy woven backstrap', 'Slip-resistant lugged traction sole']),
          inStock: 1,
          isNew: 1,
          viewers: 68,
          stockCount: 18,
          isHallOfFame: 1,
          synergyPath: 'CLASSIC',
          appeal: 'OUTDOOR',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['all-terrain clogs', 'clogs', 'khaki', 'outdoor', 'unisex']),
          sizes: JSON.stringify(['39', '40', '41', '42', '43', '44', '45']),
          images: JSON.stringify(['/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg']),
          colors: JSON.stringify(['Khaki', 'Espresso', 'Black']),
          colorVariants: JSON.stringify([{ main: '#A89476', secondary: '#B91C1C' }, { main: '#4A2B18', secondary: '#1E3A8A' }]),
          offeredDiscount: 17
        },
        {
          id: 'bec_all_terrain_02',
          name: 'Sandstorm Trail-Grip All-Terrain Clogs',
          slug: 'sandstorm-trail-grip-all-terrain-clogs',
          price: 360,
          originalPrice: 430,
          shippingFee: 30,
          image: '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg',
          category: 'All-terrain clogs',
          categoryId: 'cat_all_terrain_clogs',
          gender: 'UNISEX',
          description: 'Breathable forefoot ports and dual-density cushioning paired with an adjustable turbo strap built for all-day movement across Ghana.',
          details: JSON.stringify(['Water-friendly quick-dry body', 'Dual-density comfort footbed', 'Reinforced heel lock strap']),
          inStock: 1,
          isNew: 0,
          viewers: 44,
          stockCount: 15,
          isHallOfFame: 0,
          synergyPath: 'CLASSIC',
          appeal: 'OUTDOOR',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['all-terrain clogs', 'clogs', 'sand', 'travel']),
          sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
          images: JSON.stringify(['/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg']),
          colors: JSON.stringify(['Khaki', 'Sand']),
          colorVariants: JSON.stringify([{ main: '#C2B280', secondary: '#4A2B18' }]),
          offeredDiscount: 16
        },
        {
          id: 'bec_studded_slides_01',
          name: 'Onyx Pyramid Studded H-Strap Slides',
          slug: 'onyx-pyramid-studded-h-strap-slides',
          price: 340,
          originalPrice: 420,
          shippingFee: 25,
          image: '/uploads/bec/bec_studded_slides_1795581066443.jpg',
          category: 'Studded slides',
          categoryId: 'cat_studded_slides',
          gender: 'UNISEX',
          description: 'Matte-black H-band slides armored with gleaming gunmetal pyramid studs over a rich warm walnut stitched sole.',
          details: JSON.stringify(['Metallic pyramid stud array', 'Warm walnut stitched leatherette footbed', 'Flexible contoured outsole']),
          inStock: 1,
          isNew: 1,
          viewers: 94,
          stockCount: 14,
          isHallOfFame: 1,
          synergyPath: 'LUXE',
          appeal: 'STATEMENT',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['studded slides', 'slides', 'black', 'studs', 'streetwear']),
          sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44', '45']),
          images: JSON.stringify(['/uploads/bec/bec_studded_slides_1795581066443.jpg']),
          colors: JSON.stringify(['Black', 'Espresso']),
          colorVariants: JSON.stringify([{ main: '#141414', secondary: '#4A2B18' }, { main: '#4A2B18', secondary: '#D4AF37' }]),
          offeredDiscount: 19
        },
        {
          id: 'bec_studded_slides_02',
          name: 'Espresso Stitch Hardware Studded Slides',
          slug: 'espresso-stitch-hardware-studded-slides',
          price: 350,
          originalPrice: 430,
          shippingFee: 25,
          image: '/uploads/bec/bec_studded_slides_1795581066443.jpg',
          category: 'Studded slides',
          categoryId: 'cat_studded_slides',
          gender: 'UNISEX',
          description: 'Structured H-cut upper accented with hand-set dark metallic studs and contrast welt stitching built for standout evening wear.',
          details: JSON.stringify(['High-grip textured outsole', 'Hand-finished welt stitch trim', 'Soft inner band lining']),
          inStock: 1,
          isNew: 1,
          viewers: 59,
          stockCount: 12,
          isHallOfFame: 0,
          synergyPath: 'LUXE',
          appeal: 'STATEMENT',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['studded slides', 'slides', 'espresso', 'hardware']),
          sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
          images: JSON.stringify(['/uploads/bec/bec_studded_slides_1795581066443.jpg']),
          colors: JSON.stringify(['Black', 'Espresso']),
          colorVariants: JSON.stringify([{ main: '#261409', secondary: '#9CA3AF' }]),
          offeredDiscount: 18
        },
        {
          id: 'bec_classic_slides_01',
          name: 'Ivory Crest Emblem Classic Slides',
          slug: 'ivory-crest-emblem-classic-slides',
          price: 290,
          originalPrice: 360,
          shippingFee: 25,
          image: '/uploads/bec/bec_classic_slides_1795581065464.jpg',
          category: 'Classic slides',
          categoryId: 'cat_classic_slides',
          gender: 'UNISEX',
          description: 'Cream cushioned wide-strap classic slides finished with an embroidered crest emblem and deep black anatomical footbed.',
          details: JSON.stringify(['Cushioned cream wide leatherette strap', 'Embroidered crest emblem motif', 'Ergonomic arch-support black sole']),
          inStock: 1,
          isNew: 1,
          viewers: 81,
          stockCount: 22,
          isHallOfFame: 1,
          synergyPath: 'CLASSIC',
          appeal: 'CASUAL',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['classic slides', 'slides', 'cream', 'crest', 'comfort']),
          sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
          images: JSON.stringify(['/uploads/bec/bec_classic_slides_1795581065464.jpg']),
          colors: JSON.stringify(['Cream', 'Black']),
          colorVariants: JSON.stringify([{ main: '#FAF4EC', secondary: '#171717' }, { main: '#171717', secondary: '#B91C1C' }]),
          offeredDiscount: 19
        },
        {
          id: 'bec_classic_slides_02',
          name: 'Oat & Charcoal Wide-Band Classic Slides',
          slug: 'oat-charcoal-wide-band-classic-slides',
          price: 270,
          originalPrice: 340,
          shippingFee: 25,
          image: '/uploads/bec/bec_classic_slides_1795581065464.jpg',
          category: 'Classic slides',
          categoryId: 'cat_classic_slides',
          gender: 'UNISEX',
          description: 'Featherweight slip-on classic slides engineered with extra-plush strap padding for poolside lounging and everyday errands.',
          details: JSON.stringify(['Soft-touch inner jersey lining', 'Deep cupped heel cradle', 'Water-resistant EVA base']),
          inStock: 1,
          isNew: 0,
          viewers: 51,
          stockCount: 24,
          isHallOfFame: 0,
          synergyPath: 'CLASSIC',
          appeal: 'CASUAL',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['classic slides', 'slides', 'oat', 'everyday']),
          sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44', '45']),
          images: JSON.stringify(['/uploads/bec/bec_classic_slides_1795581065464.jpg']),
          colors: JSON.stringify(['Cream', 'Black']),
          colorVariants: JSON.stringify([{ main: '#F5EAD8', secondary: '#1F2937' }]),
          offeredDiscount: 20
        },
        {
          id: 'bec_double_strap_01',
          name: 'Cream & Tartan Double-Strap Sandals',
          slug: 'cream-tartan-double-strap-sandals',
          price: 360,
          originalPrice: 440,
          shippingFee: 25,
          image: '/uploads/bec/bec_double_strap_sandals_1795581066438.jpg',
          category: 'Double-strap sandals',
          categoryId: 'cat_double_strap_sandals',
          gender: 'UNISEX',
          description: 'Signature cream and crimson tartan plaid double-strap sandals topped with tonal hardware buckles and a cushioned cloud sole.',
          details: JSON.stringify(['Two adjustable front buckle straps', 'Woven red & beige tartan check upper', 'Contoured cream platform outsole']),
          inStock: 1,
          isNew: 1,
          viewers: 72,
          stockCount: 16,
          isHallOfFame: 1,
          synergyPath: 'LUXE',
          appeal: 'HERITAGE',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['double-strap sandals', 'sandals', 'tartan', 'plaid', 'cream']),
          sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
          images: JSON.stringify(['/uploads/bec/bec_double_strap_sandals_1795581066438.jpg']),
          colors: JSON.stringify(['Cream', 'Red', 'Tan']),
          colorVariants: JSON.stringify([{ main: '#FAF4EC', secondary: '#991B1B' }, { main: '#D2B48C', secondary: '#4A2B18' }]),
          offeredDiscount: 18
        },
        {
          id: 'bec_double_strap_02',
          name: 'Heritage Check Twin-Buckle Sandals',
          slug: 'heritage-check-twin-buckle-sandals',
          price: 350,
          originalPrice: 420,
          shippingFee: 25,
          image: '/uploads/bec/bec_double_strap_sandals_1795581066438.jpg',
          category: 'Double-strap sandals',
          categoryId: 'cat_double_strap_sandals',
          gender: 'UNISEX',
          description: 'Crisp beige and crimson check twin-strap sandals offering tailored instep adjustment and cushioned heel rebound.',
          details: JSON.stringify(['Customizable twin-strap lockdown', 'Suede-lined comfort footbed', 'Non-marking cream tread sole']),
          inStock: 1,
          isNew: 0,
          viewers: 47,
          stockCount: 14,
          isHallOfFame: 0,
          synergyPath: 'LUXE',
          appeal: 'HERITAGE',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['double-strap sandals', 'sandals', 'beige', 'buckle']),
          sizes: JSON.stringify(['38', '39', '40', '41', '42', '43']),
          images: JSON.stringify(['/uploads/bec/bec_double_strap_sandals_1795581066438.jpg']),
          colors: JSON.stringify(['Cream', 'Tan']),
          colorVariants: JSON.stringify([{ main: '#F5EAD8', secondary: '#8C532B' }]),
          offeredDiscount: 16
        },
        {
          id: 'bec_designer_clogs_01',
          name: 'Obsidian Web-Sculpted Designer Clogs',
          slug: 'obsidian-web-sculpted-designer-clogs',
          price: 420,
          originalPrice: 520,
          shippingFee: 30,
          image: '/uploads/bec/bec_designer_clogs_1795581067141.jpg',
          category: 'Designer clogs',
          categoryId: 'cat_designer_clogs',
          gender: 'UNISEX',
          description: 'Architectural matte obsidian designer clogs carved with web-inspired upper cutouts, vivid crimson cushioned footbed, and pivot heel strap.',
          details: JSON.stringify(['Sculpted matte-black perforated upper', 'Crimson shock-absorbing insole', 'Pivoting convertible sport strap']),
          inStock: 1,
          isNew: 1,
          viewers: 112,
          stockCount: 11,
          isHallOfFame: 1,
          synergyPath: 'DESIGNER',
          appeal: 'STREETS',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['designer clogs', 'clogs', 'black', 'sculpted', 'limited']),
          sizes: JSON.stringify(['39', '40', '41', '42', '43', '44', '45']),
          images: JSON.stringify(['/uploads/bec/bec_designer_clogs_1795581067141.jpg']),
          colors: JSON.stringify(['Black', 'Red']),
          colorVariants: JSON.stringify([{ main: '#111111', secondary: '#B91C1C' }, { main: '#3B2010', secondary: '#FAF4EC' }]),
          offeredDiscount: 19
        },
        {
          id: 'bec_designer_clogs_02',
          name: 'Stealth Cutout Street Designer Clogs',
          slug: 'stealth-cutout-street-designer-clogs',
          price: 400,
          originalPrice: 480,
          shippingFee: 30,
          image: '/uploads/bec/bec_designer_clogs_1795581067141.jpg',
          category: 'Designer clogs',
          categoryId: 'cat_designer_clogs',
          gender: 'UNISEX',
          description: 'Lightweight sculpted street clogs molded in satin black polymer with contoured airflow channels and thick impact outsole.',
          details: JSON.stringify(['Airflow cutout upper shell', 'Raised arch & heel support', 'Easy-clean waterproof compound']),
          inStock: 1,
          isNew: 1,
          viewers: 76,
          stockCount: 13,
          isHallOfFame: 0,
          synergyPath: 'DESIGNER',
          appeal: 'STREETS',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['designer clogs', 'clogs', 'stealth', 'black']),
          sizes: JSON.stringify(['39', '40', '41', '42', '43', '44']),
          images: JSON.stringify(['/uploads/bec/bec_designer_clogs_1795581067141.jpg']),
          colors: JSON.stringify(['Black']),
          colorVariants: JSON.stringify([{ main: '#0F0F0F', secondary: '#4A2B18' }]),
          offeredDiscount: 16
        },
        {
          id: 'bec_double_band_01',
          name: 'Heritage Tartan & Star Double-Band Slippers',
          slug: 'heritage-tartan-star-double-band-slippers',
          price: 330,
          originalPrice: 400,
          shippingFee: 25,
          image: '/uploads/bec/bec_double_band_slippers_1795581068033.jpg',
          category: 'Double-band slippers',
          categoryId: 'cat_double_band_slippers',
          gender: 'UNISEX',
          description: 'Executive double-band slippers pairing classic tan check twill bands and glossy star-medallion accents on a deep black comfort base.',
          details: JSON.stringify(['Heritage check band & star accent craftsmanship', 'Contoured anti-fatigue black footbed', 'Sturdy indoor-outdoor rubber outsole']),
          inStock: 1,
          isNew: 1,
          viewers: 87,
          stockCount: 19,
          isHallOfFame: 1,
          synergyPath: 'LUXE',
          appeal: 'SIGNATURE',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['double-band slippers', 'slippers', 'tartan', 'star', 'black']),
          sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
          images: JSON.stringify(['/uploads/bec/bec_double_band_slippers_1795581068033.jpg']),
          colors: JSON.stringify(['Tan', 'Black', 'Espresso']),
          colorVariants: JSON.stringify([{ main: '#C3A882', secondary: '#1A1A1A' }, { main: '#111111', secondary: '#D4AF37' }]),
          offeredDiscount: 17
        },
        {
          id: 'bec_double_band_02',
          name: 'Noir Gloss Star-Crest Double-Band Slippers',
          slug: 'noir-gloss-star-crest-double-band-slippers',
          price: 320,
          originalPrice: 390,
          shippingFee: 25,
          image: '/uploads/bec/bec_double_band_slippers_1795581068033.jpg',
          category: 'Double-band slippers',
          categoryId: 'cat_double_band_slippers',
          gender: 'UNISEX',
          description: 'Sleek glossy black slippers accented with metallic star hardware and soft cushioned sole for smart casual daily wear.',
          details: JSON.stringify(['Metallic star stud accents', 'Cushioned contoured footbed', 'Flexible grip tread']),
          inStock: 1,
          isNew: 0,
          viewers: 61,
          stockCount: 17,
          isHallOfFame: 0,
          synergyPath: 'LUXE',
          appeal: 'SIGNATURE',
          brand: 'B.E.C Footwear',
          tags: JSON.stringify(['double-band slippers', 'slippers', 'noir', 'gloss']),
          sizes: JSON.stringify(['38', '39', '40', '41', '42', '43', '44']),
          images: JSON.stringify(['/uploads/bec/bec_double_band_slippers_1795581068033.jpg']),
          colors: JSON.stringify(['Black', 'Gold']),
          colorVariants: JSON.stringify([{ main: '#111111', secondary: '#D4AF37' }]),
          offeredDiscount: 18
        }
      ];

      const nowIso = new Date().toISOString();
      for (const p of becProducts) {
        await db.run(
          `INSERT OR REPLACE INTO products (
            id, name, slug, price, originalPrice, shippingFee, image, category, categoryId, gender,
            description, details, inStock, isNew, viewers, stockCount, isHallOfFame,
            synergyPath, appeal, brand, tags, sizes, images, colors, colorVariants, createdAt, offeredDiscount
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            p.id, p.name, p.slug, p.price, p.originalPrice, p.shippingFee, p.image, p.category, p.categoryId, p.gender,
            p.description, p.details, p.inStock, p.isNew, p.viewers, p.stockCount, p.isHallOfFame,
            p.synergyPath, p.appeal, p.brand, p.tags, p.sizes, p.images, p.colors, p.colorVariants, nowIso, p.offeredDiscount
          ]
        );
      }

      // Ensure any other existing products also map to one of the 6 B.E.C Footwear categories
      await db.exec(`
        UPDATE products
        SET categoryId = (
          SELECT c.id FROM categories c
          WHERE LOWER(TRIM(c.name)) = LOWER(TRIM(products.category))
             OR LOWER(TRIM(c.slug)) = LOWER(TRIM(products.category))
          LIMIT 1
        )
        WHERE categoryId IS NULL OR categoryId = ''
      `);

      const { cacheInvalidatePattern } = await import('./lib/cache.js');
      await cacheInvalidatePattern('products:');
      await cacheInvalidatePattern('categories:');
      console.log("B.E.C Footwear product catalog seeded and synchronized");
    } catch (e) {
      console.error("Error seeding B.E.C Footwear products:", e);
    }

    try {
      // Migration: Update PK to (userId, protocolType)
      const tableInfo = await db.all("PRAGMA table_info(protocol_sessions)");
      const isOldSchema = tableInfo.length > 0 && tableInfo.filter((c: any) => c.pk === 1).length === 1 && tableInfo.find((c: any) => c.name === 'userId' && c.pk === 1);
      if (isOldSchema) {
        console.log("Migrating protocol_sessions table to new schema...");
        await db.exec("DROP TABLE protocol_sessions");
      }
      await db.exec("CREATE TABLE IF NOT EXISTS protocol_sessions (userId VARCHAR(255), protocolType TEXT, currentStep INT, sessionData TEXT, lastUpdated INT, PRIMARY KEY (userId, protocolType), FOREIGN KEY (userId) REFERENCES users(id))");
      console.log("Created/Verified protocol_sessions table");
    } catch (e) {
      console.error("Error creating/migrating protocol_sessions table:", e);
    }

    const supplierColumns = [
      "contactEmail TEXT",
      "password TEXT",
      "region TEXT",
      "status TEXT",
      "performanceScore INT DEFAULT 100",
      "totalRevenueYield DOUBLE DEFAULT 0",
      "joinedDate TEXT",
      "commissionRate DOUBLE DEFAULT 10",
      "paystackSubaccountCode TEXT",
      "bankAccount TEXT",
      "bankCode TEXT"
    ];

    for (const col of supplierColumns) {
      try {
        await db.exec(`ALTER TABLE suppliers ADD COLUMN ${col}`);
        console.log(`Added ${col.split(' ')[0]} column to suppliers table`);
      } catch (e: any) {
        if (!e.message.includes('duplicate column name')) {
          console.error(`Error adding ${col.split(' ')[0]} column:`, e);
        }
      }
    }

    try {
      await db.exec("ALTER TABLE categories ADD COLUMN heroImage TEXT");
      console.log("Added heroImage column to categories table");
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) {
        console.error("Error adding heroImage column:", e);
      }
    }

    try {
      await db.exec("ALTER TABLE categories ADD COLUMN inspiration TEXT");
      console.log("Added inspiration column to categories table");
    } catch (e: any) {
      if (!e.message.includes('duplicate column name')) {
        console.error("Error adding inspiration column:", e);
      }
    }

    try {
      await db.exec("ALTER TABLE price_anomalies ADD COLUMN discountedPrice DOUBLE");
    } catch (e) {}
    try {
      await db.exec("ALTER TABLE price_anomalies ADD COLUMN price DOUBLE");
    } catch (e) {}

    // Style Passport Columns for user_preferences
    const userPrefColumns = [
      "aesthetics TEXT",
      "clothingSizes TEXT",
      "fitPreference TEXT",
      "budgetTier TEXT",
      "occasions TEXT",
      "styleSummary TEXT",
      "personalizationEnabled INT DEFAULT 1",
      "dislikedProductIds TEXT"
    ];
    for (const col of userPrefColumns) {
      try {
        await db.exec(`ALTER TABLE user_preferences ADD COLUMN ${col}`);
      } catch (e: any) {
        // Safe to ignore duplicate column errors
      }
    }

    // Insert mock user u1
    const mockHash = await bcrypt.hash('password', 10);
    await db.exec(`INSERT OR IGNORE INTO users (id, handle, email, password, role) VALUES ('u1', 'Guest User', 'guest@example.com', '${mockHash}', 'user')`);
    
    // Clean up any old default admin using the user's personal email to prevent registration conflicts,
    // but ONLY if the account role is 'ADMIN' (to avoid deleting the account once they register as a normal user).
    const userEmailToCleanup = 'lenoakowan@gmail.com';
    const blockedUser = await db.get("SELECT id, role FROM users WHERE email = ?", [userEmailToCleanup]);
    if (blockedUser && blockedUser.role === 'ADMIN') {
      console.log(`Cleaning up registration conflict for email: ${userEmailToCleanup}`);
      await db.run("DELETE FROM admins WHERE id = ?", [blockedUser.id]);
      await db.run("DELETE FROM users WHERE id = ?", [blockedUser.id]);
    }

    // Create admins from environment or default if not exist
    const adminEmails = [process.env.ADMIN_EMAIL || 'admin@becfootwear.gh', 'admin@becfootwear.gh'];
    const adminHandle = 'leno';
    const adminPass = process.env.ADMIN_PASS || '1q2w3!';
    const adminHash = await bcrypt.hash(adminPass, 10);
    
    for (const email of adminEmails) {
      const existingAdmin = await db.get("SELECT * FROM admins WHERE email = ?", [email]);
      if (!existingAdmin) {
        const adminId = `admin_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        await db.run("INSERT OR IGNORE INTO users (id, handle, email, password, role) VALUES (?, ?, ?, ?, ?)", [adminId, adminHandle, email, adminHash, 'ADMIN']);
        await db.run("INSERT OR IGNORE INTO admins (id, email, password, handle) VALUES (?, ?, ?, ?)", [adminId, email, adminHash, adminHandle]);
        console.log(`Default admin created: ${email}`);
      }
    }

    // Ensure upload directories exist
    const uploadDirs = [
      'public',
      'public/uploads',
      'public/uploads/products',
      'public/uploads/feeds',
      'public/uploads/admin',
      'public/uploads/profiles'
    ];
    
    for (const dir of uploadDirs) {
      if (!fs.existsSync(path.join(process.cwd(), dir))) {
        fs.mkdirSync(path.join(process.cwd(), dir), { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    }

    await initBundlesTable();
    await initMarketingTables();

    // High-performance database secondary indexes to prevent full table scans
    const perfIndexes = [
      "CREATE INDEX IF NOT EXISTS idx_products_categoryId ON products(categoryId)",
      "CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)",
      "CREATE INDEX IF NOT EXISTS idx_products_inStock ON products(inStock)",
      "CREATE INDEX IF NOT EXISTS idx_products_createdAt ON products(createdAt)",
      "CREATE INDEX IF NOT EXISTS idx_products_supplierId ON products(supplierId)",
      "CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId)",
      "CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)",
      "CREATE INDEX IF NOT EXISTS idx_orders_timestamp ON orders(timestamp)",
      "CREATE INDEX IF NOT EXISTS idx_referrals_referrerId ON referrals(referrerId)",
      "CREATE INDEX IF NOT EXISTS idx_referrals_refereeId ON referrals(refereeId)",
      "CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(code)",
      "CREATE INDEX IF NOT EXISTS idx_referral_ledger_userId ON referral_ledger(userId)",
      "CREATE INDEX IF NOT EXISTS idx_social_posts_userId ON social_posts(userId)",
      "CREATE INDEX IF NOT EXISTS idx_social_posts_weekId ON social_posts(weekId)",
      "CREATE INDEX IF NOT EXISTS idx_social_comments_postId ON social_comments(postId)",
      "CREATE INDEX IF NOT EXISTS idx_cart_items_userId ON cart_items(userId)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_recipientId ON notifications(recipientId)",
      "CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read)",
      "CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)",
      "CREATE INDEX IF NOT EXISTS idx_users_handle ON users(handle)",
      "CREATE INDEX IF NOT EXISTS idx_users_referralCode ON users(referralCode)",
      "CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)",
      "CREATE INDEX IF NOT EXISTS idx_reviews_productId ON reviews(productId)"
    ];
    for (const sql of perfIndexes) {
      try {
        await db.run(sql);
      } catch (e) {
        // Safe to ignore if index exists or table is created subsequently
      }
    }
    console.log('Database performance indexes verified successfully');
  } catch (err) {
    console.warn("Database initialization warning (continuing startup):", err);
  }
}

let appPromise: Promise<express.Express> | null = null;

export async function createApp(): Promise<express.Express> {
  if (appPromise) return appPromise;

  appPromise = (async () => {
    try {
      await initializeDatabase();
    } catch (err) {
      console.warn("Non-fatal warning during database initialization, continuing startup...", err);
    }
    const app = express();
    app.set('trust proxy', 1);

  // 6. Helmet CSP with allowances for Paystack, Plausible, Google Fonts, Sentry, and iframe preview
  app.use(helmet({
    frameguard: false, // Critical: allows preview iframe embedding in AI Studio
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://plausible.io", "https://*.paystack.co", "https://js.paystack.co"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        connectSrc: ["'self'", "https://*.paystack.co", "https://api.paystack.co", "https://plausible.io", "https://*.sentry.io", "https://*.huggingface.co", "https://huggingface.co", "wss:", "ws:"],
        frameSrc: ["'self'", "https://*.paystack.co", "https://standard.paystack.co"],
        frameAncestors: ["*"], // Allow iframe preview in AI Studio
      }
    }
  }));

  const PORT = process.env.PORT || 3000;

  app.use(compression({
    threshold: 512,
  }));

  // 5. CORS allowlist from FRONTEND_URL & custom domains
  const frontendUrl = process.env.FRONTEND_URL || 'https://becfootwear.gh';
  const allowedOrigins = [
    frontendUrl,
    'https://becfootwear.gh',
    'https://www.becfootwear.gh',
    'http://becfootwear.gh',
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ].filter(Boolean);

  const allowedOriginPatterns = [
    /becfootwear\.gh$/i,
    /vercel\.app$/i,
    /run\.app$/i,
    /localhost/i,
    /127\.0\.0\.1/
  ];

  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed =
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.includes(origin) ||
        allowedOriginPatterns.some(p => p.test(origin));

      if (isAllowed) {
        return callback(null, true);
      }
      // Never throw an uncaught Error into Express for non-matching origins;
      // return callback(null, false) so request proceeds cleanly
      return callback(null, false);
    },
    credentials: true
  }));

  // 3. Express Rate Limiters: strict on auth & ai, moderate on rest
  const strictLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later.' }
  });

  const moderateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 'error', message: 'Too many requests, please try again later.' }
  });

  // 4. Body parsers: 15mb limit to support mobile camera photos for visual-search and try-on
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ limit: '15mb', extended: true }));
  app.use(cookieParser());

  app.use('/api/auth', strictLimiter);
  app.use('/api/ai', strictLimiter);
  app.use('/api', moderateLimiter);

  // Explicit Favicon handler - prevents 404/500 errors from browser auto-requests
  app.get('/favicon.ico', (req, res) => {
    try {
      const candidates = [
        path.join(process.cwd(), 'public/favicon.ico'),
        path.join(process.cwd(), 'dist/favicon.ico'),
        path.join(__dirname_resolved, 'public/favicon.ico'),
        path.join(__dirname_resolved, '../public/favicon.ico'),
        path.join(__dirname_resolved, 'dist/favicon.ico')
      ];
      const target = candidates.find(p => {
        try { return fs.existsSync(p); } catch { return false; }
      });
      if (target) {
        res.setHeader('Content-Type', 'image/x-icon');
        res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
        return res.sendFile(target, (err) => {
          if (err && !res.headersSent) {
            res.status(204).end();
          }
        });
      }
    } catch {
      // ignore
    }
    return res.status(204).end();
  });

  // Special static routes with Cloudflare-aligned cache control headers
  app.use('/logo.svg', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
    next();
  });
  app.use('/manifest.json', (req, res, next) => {
    res.setHeader('Cache-Control', 'public, max-age=604800'); // 1 week
    next();
  });

  const uploadsCacheOptions = {
    maxAge: '1d',
    setHeaders: (res: any) => {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=3600');
    }
  };

  const assetsCacheOptions = {
    maxAge: '1y',
    setHeaders: (res: any) => {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  };

  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads'), uploadsCacheOptions));
  app.use('/assets/aistudio', express.static(path.join(process.cwd(), 'public/assets/aistudio'), uploadsCacheOptions));
  app.use('/img', express.static(path.join(process.cwd(), 'public/img'), uploadsCacheOptions));
  app.use('/clothes', express.static(path.join(process.cwd(), 'clothes'), uploadsCacheOptions));
  app.use('/assets', express.static(path.join(process.cwd(), 'dist/assets'), assetsCacheOptions));

  // Public catalog HTTP cache headers for instant client responses
  app.use('/api/categories', (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }
    next();
  });
  app.use('/api/bundles', (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=120');
    }
    next();
  });
  app.use('/api/tags', (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=120, stale-while-revalidate=600');
    }
    next();
  });
  app.use('/api/products', (req, res, next) => {
    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=15, stale-while-revalidate=60');
    }
    next();
  });

  // API Routes (Specific prefixes mounted first)
  app.use('/api/products', productsRouter);
  app.use('/api/reviews', reviewsRouter);
  app.use('/api/referrals', referralsRouter);
  app.use('/api/suppliers', suppliersRouter);
  app.use('/api/supply_orders', supplyOrdersRouter);
  app.use('/api/users', usersRouter);
  app.use('/api/admins', adminsRouter);
  app.use('/api/orders', ordersRouter);
  app.use('/api/auth', authRouter);
  app.use('/api/bundles', bundlesRouter);
  app.use('/api/user', userRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api/tags', tagsRouter);
  app.use('/api/categories', categoriesRouter);
  app.use('/api/ai', aiRouter);
  app.use('/api/marketing', marketingRouter);

  // Catch-all sub-routers mounted at root '/api' path
  app.use('/api', socialRouter);
  app.use('/api', userStatsRouter);
  app.use('/api', miscRouter);
  
  app.get('/api/health', async (req, res) => {
    try {
      await db.get('SELECT 1');
      res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
      res.status(500).json({ status: 'error', message: 'Database connection failed' });
    }
  });

  let viteDevActive = false;
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { 
          middlewareMode: true,
          hmr: false // Disable HMR to avoid port conflicts in some environments
        },
        appType: "spa",
      });
      app.use(vite.middlewares);
      viteDevActive = true;
    } catch (viteErr) {
      console.warn('Vite dev server middleware unavailable, falling back to compiled SPA static assets');
    }
  }

  if (!viteDevActive) {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { maxAge: '1d' }));

    const serveIndexHtml = (res: express.Response) => {
      const candidates = [
        path.join(distPath, 'index.html'),
        path.join(__dirname_resolved, 'dist/index.html'),
        path.join(__dirname_resolved, '../dist/index.html'),
        path.join(process.cwd(), 'index.html'),
        path.join(__dirname_resolved, 'index.html')
      ];
      for (const cand of candidates) {
        if (fs.existsSync(cand)) {
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          return res.sendFile(cand, (err) => {
            if (err && !res.headersSent) {
              try {
                const content = fs.readFileSync(cand, 'utf-8');
                res.status(200).send(content);
              } catch {
                res.status(200).send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>B.E.C Footwear</title></head><body><div id="root"></div></body></html>');
              }
            }
          });
        }
      }
      res.status(200).send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>B.E.C Footwear</title></head><body><div id="root"></div></body></html>');
    };

    app.use((req, res, next) => {
      // Don't intercept API routes that didn't match
      if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'Endpoint not found', path: req.path });
      }
      serveIndexHtml(res);
    });
  }

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled Express Error:', err);
    if (res.headersSent) {
      return next(err);
    }
    if (req.path.startsWith('/api')) {
      return res.status(500).json({ status: 'error', message: 'Internal Server Error' });
    }
    // For non-API document requests (like GET / or /favicon.ico), don't show 500 JSON, recover with SPA index.html
    try {
      const distIndex = path.join(process.cwd(), 'dist/index.html');
      if (fs.existsSync(distIndex)) {
        return res.status(200).sendFile(distIndex, () => {
          if (!res.headersSent) res.status(200).send('<!DOCTYPE html><html><head><title>B.E.C Footwear</title></head><body><div id="root"></div></body></html>');
        });
      }
    } catch {}
    res.status(200).send('<!DOCTYPE html><html><head><title>B.E.C Footwear</title></head><body><div id="root"></div></body></html>');
  });

  return app;
  })();

  return appPromise;
}

async function startServer() {
  if ((global as any).serverStarted) {
    console.log('Express server already started (global.serverStarted is true). Skipping duplicate startServer() invocation.');
    return;
  }
  (global as any).serverStarted = true;

  const app = await createApp();

  // Support Phusion Passenger, Unix domain sockets, and standard TCP ports
  let server: any;
  const rawPort = process.env.PORT;

  if (typeof (global as any).PhusionPassenger !== 'undefined') {
    (global as any).PhusionPassenger.configure({ autoInstall: false });
    server = app.listen('passenger', () => {
      console.log('B.E.C Footwear running under Phusion Passenger');
    });
  } else if (rawPort && !/^\d+$/.test(String(rawPort))) {
    // Passenger or hosting assigned a Unix socket path or named pipe
    server = app.listen(rawPort, () => {
      console.log(`B.E.C Footwear listening on socket: ${rawPort}`);
    });
  } else {
    const portNum = Number(rawPort) || 3000;
    server = app.listen(portNum, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${portNum}`);
    });
  }

  // WebSocket Server
  let wss: WebSocketServer | null = null;
  try {
    wss = new WebSocketServer({ server, path: '/ws' });
  } catch (wsErr) {
    console.warn('WebSocket server initialization warning:', wsErr);
  }
  const clients = new Set<WebSocket>();

  if (wss) {
    wss.on('connection', (ws) => {
    clients.add(ws);
    
    // Broadcast active users count
    const broadcastActiveUsers = () => {
      const count = clients.size + 1024; // Base 1024 + real connections
      const message = JSON.stringify({ type: 'USER_COUNT', count });
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    };

    broadcastActiveUsers();

    ws.on('close', () => {
      clients.delete(ws);
      broadcastActiveUsers();
    });

    // Handle incoming messages if needed
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'PURCHASE') {
          // Broadcast purchase notification
          const notification = JSON.stringify({
            type: 'SOCIAL_PROOF',
            message: `${message.handle} just copped ${message.itemName}!`,
            timestamp: Date.now()
          });
          clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
              client.send(notification);
            }
          });
        }
      } catch (e) {
        console.error('WS Message Error:', e);
      }
    });
  });
  }

  // Periodic activity simulation
  setInterval(() => {
    if (clients.size > 0) {
      const activities = [
        'Customer in Accra just ordered Khaki & Crimson All-Terrain Clogs',
        'Nationwide dispatch ready: Studded Slides in EU 38–45',
        '3 shoppers added Obsidian Designer Clogs to bag',
        'Order via Call or WhatsApp: 0244122075 / 0260584440'
      ];
      const activity = activities[Math.floor(Math.random() * activities.length)];
      const message = JSON.stringify({ type: 'ACTIVITY', activity });
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }, 15000);
}

// Handle uncaught exceptions and unhandled rejections to prevent server crash
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  } else if (typeof reason === 'object' && reason !== null) {
    console.error('Reason Object:', JSON.stringify(reason, null, 2));
  }
});

if (!process.env.VERCEL) {
  startServer();
}
