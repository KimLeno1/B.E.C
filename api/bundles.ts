import { Router } from 'express';
import { db } from '../server.js';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';

const router = Router();

// Ensure bundles table exists with required schema
export async function initBundlesTable() {
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS bundles (
        id VARCHAR(255) PRIMARY KEY,
        name TEXT NOT NULL,
        slug VARCHAR(255) UNIQUE,
        description TEXT,
        heroImage TEXT,
        products TEXT, -- JSON array
        items TEXT, -- JSON array of {productId, quantity}
        bundlePrice DOUBLE NOT NULL,
        originalPrice DOUBLE DEFAULT 0,
        savings DOUBLE DEFAULT 0,
        expiresIn INT,
        expiresAt TEXT,
        isActive INT DEFAULT 1
      )
    `);

    // In case bundles was created with an older schema, migrate missing columns
    const columnsToAdd = [
      { name: 'slug', def: 'VARCHAR(255)' },
      { name: 'heroImage', def: 'TEXT' },
      { name: 'products', def: 'TEXT' },
      { name: 'items', def: 'TEXT' },
      { name: 'originalPrice', def: 'DOUBLE DEFAULT 0' },
      { name: 'savings', def: 'DOUBLE DEFAULT 0' },
      { name: 'expiresIn', def: 'INT' },
      { name: 'expiresAt', def: 'TEXT' },
      { name: 'isActive', def: 'INT DEFAULT 1' }
    ];

    for (const col of columnsToAdd) {
      try {
        await db.exec(`ALTER TABLE bundles ADD COLUMN ${col.name} ${col.def}`);
      } catch (e) {
        // Ignored if column already exists
      }
    }

    // Remove legacy Closet Kraze bundles and seed B.E.C Footwear packs
    const legacyBundleIds = ['bundle_date_night', 'bundle_sneakerhead', 'bundle_festival', 'bundle_couples', 'bundle_full_kraze'];
    for (const oldId of legacyBundleIds) {
      await db.run('DELETE FROM bundles WHERE id = ?', [oldId]);
    }

    const countRow = await db.get('SELECT COUNT(*) as count FROM bundles');
    if (!countRow || countRow.count === 0) {
      const defaultBundles = [
        {
          id: 'bundle_bec_slide_duo',
          name: 'Classic & Studded Slide Duo',
          slug: 'classic-studded-slide-duo',
          description: '1x Ivory Crest Classic Slides + 1x Onyx Pyramid Studded Slides. Save GH₵ 70 with nationwide delivery.',
          heroImage: '/uploads/bec/bec_studded_slides_1795581066443.jpg',
          items: JSON.stringify([
            { productId: 'bec_classic_slides_01', quantity: 1 },
            { productId: 'bec_studded_slides_01', quantity: 1 }
          ]),
          bundlePrice: 560,
          originalPrice: 630,
          savings: 70,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: 1
        },
        {
          id: 'bundle_bec_clog_pack',
          name: 'All-Terrain & Designer Clog Pack',
          slug: 'all-terrain-designer-clog-pack',
          description: '1x Khaki All-Terrain Clogs + 1x Obsidian Web-Sculpted Designer Clogs built for indoor and outdoor rotation.',
          heroImage: '/uploads/bec/bec_all_terrain_clogs_1795581066361.jpg',
          items: JSON.stringify([
            { productId: 'bec_all_terrain_01', quantity: 1 },
            { productId: 'bec_designer_clogs_01', quantity: 1 }
          ]),
          bundlePrice: 710,
          originalPrice: 800,
          savings: 90,
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: 1
        },
        {
          id: 'bundle_bec_weekend_trio',
          name: 'Tartan Sandal & Slipper Rotation',
          slug: 'tartan-sandal-slipper-rotation',
          description: '1x Cream & Tartan Double-Strap Sandals + 1x Heritage Double-Band Slippers + 1x Classic Slides.',
          heroImage: '/uploads/bec/bec_double_strap_sandals_1795581066438.jpg',
          items: JSON.stringify([
            { productId: 'bec_double_strap_01', quantity: 1 },
            { productId: 'bec_double_band_01', quantity: 1 },
            { productId: 'bec_classic_slides_01', quantity: 1 }
          ]),
          bundlePrice: 860,
          originalPrice: 980,
          savings: 120,
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: 1
        }
      ];

      for (const b of defaultBundles) {
        await db.run(
          `INSERT OR REPLACE INTO bundles (id, name, slug, description, heroImage, items, products, bundlePrice, originalPrice, savings, expiresAt, isActive)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [b.id, b.name, b.slug, b.description, b.heroImage, b.items, b.items, b.bundlePrice, b.originalPrice, b.savings, b.expiresAt, b.isActive]
        );
      }
      console.log('✅ Seeded B.E.C Footwear bundles successfully.');
    }
  } catch (err) {
    console.error('Error initializing bundles table:', err);
  }
}

// GET /api/bundles - list active bundles
router.get('/', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM bundles WHERE isActive = 1 OR isActive IS NULL');
    const bundles = [];

    for (const row of rows) {
      let rawItems: any[] = [];
      try {
        rawItems = row.items ? (typeof row.items === 'string' ? JSON.parse(row.items) : row.items) : [];
      } catch (e) {
        rawItems = [];
      }

      if ((!rawItems || rawItems.length === 0) && row.products) {
        try {
          const prods = typeof row.products === 'string' ? JSON.parse(row.products) : row.products;
          if (Array.isArray(prods)) {
            rawItems = prods.map((p: any) => typeof p === 'object' ? { productId: p.id, quantity: 1, ...p } : { productId: p, quantity: 1 });
          }
        } catch (e) {}
      }

      const populatedProducts: any[] = [];
      for (const item of rawItems) {
        const prodId = item.productId || item.id;
        if (prodId) {
          const prod = await db.get('SELECT * FROM products WHERE id = ?', [prodId]);
          if (prod) {
            let parsedImages = [prod.image];
            if (prod.images) {
              try {
                parsedImages = typeof prod.images === 'string' ? JSON.parse(prod.images) : prod.images;
              } catch (e) {
                parsedImages = [prod.image];
              }
            }
            let parsedSizes = [];
            if (prod.sizes) {
              try {
                parsedSizes = typeof prod.sizes === 'string' ? JSON.parse(prod.sizes) : prod.sizes;
              } catch (e) {
                parsedSizes = [];
              }
            }

            populatedProducts.push({
              ...prod,
              images: parsedImages,
              sizes: parsedSizes,
              quantityInBundle: item.quantity || 1
            });
          } else if (item.name) {
            // Item already has product attributes
            populatedProducts.push(item);
          }
        } else if (item.name) {
          populatedProducts.push(item);
        }
      }

      bundles.push({
        ...row,
        items: rawItems,
        products: populatedProducts
      });
    }

    res.json(bundles);
  } catch (error) {
    console.error('Error fetching bundles:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch bundles' });
  }
});

// GET /api/bundles/:slug - bundle detail with item products populated
router.get('/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    let bundle = await db.get('SELECT * FROM bundles WHERE slug = ? OR id = ?', [slugOrId, slugOrId]);
    if (!bundle) {
      return res.status(404).json({ status: 'error', message: 'Bundle not found' });
    }

    const items = bundle.items ? JSON.parse(bundle.items) : [];
    const populatedProducts = [];

    for (const item of items) {
      const prod = await db.get('SELECT * FROM products WHERE id = ?', [item.productId]);
      if (prod) {
        populatedProducts.push({
          ...prod,
          images: prod.images ? JSON.parse(prod.images) : [prod.image],
          quantityInBundle: item.quantity
        });
      }
    }

    res.json({
      ...bundle,
      items,
      products: populatedProducts
    });
  } catch (error) {
    console.error('Error fetching bundle detail:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch bundle detail' });
  }
});

// POST /api/bundles/:slug/checkout - atomic checkout for bundle purchase
router.post('/:slugOrId/checkout', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const { customerName, customerEmail, phone, address, city, region, quantity = 1, friendGroupDiscount = false } = req.body;

    const bundle = await db.get('SELECT * FROM bundles WHERE slug = ? OR id = ?', [slugOrId, slugOrId]);
    if (!bundle) {
      return res.status(404).json({ status: 'error', message: 'Bundle not found' });
    }

    const items = bundle.items ? JSON.parse(bundle.items) : [];
    let finalPrice = bundle.bundlePrice * quantity;
    if (friendGroupDiscount || quantity >= 3) {
      finalPrice = finalPrice * 0.9; // 10% off friend group pricing
    }

    // Check stock for all bundle items
    for (const item of items) {
      const requiredQty = item.quantity * quantity;
      const prod = await db.get('SELECT id, name, stockCount FROM products WHERE id = ?', [item.productId]);
      if (!prod) {
        return res.status(400).json({ status: 'error', message: 'Product item not found.' });
      }
      if (prod.stockCount !== undefined && prod.stockCount !== null && prod.stockCount < requiredQty) {
        return res.status(400).json({ status: 'error', message: `Insufficient stock for item "${prod.name}".` });
      }
    }

    // Atomic deduction and order creation
    const orderId = 'ord_' + crypto.randomUUID();
    const timestamp = new Date().toISOString();

    for (const item of items) {
      const requiredQty = item.quantity * quantity;
      await db.run('UPDATE products SET stockCount = MAX(0, stockCount - ?) WHERE id = ?', [requiredQty, item.productId]);
    }

    // Create order record
    const orderItemsJson = JSON.stringify(items.map((i: any) => ({ id: i.productId, quantity: i.quantity * quantity, isBundleItem: true, bundleId: bundle.id })));
    await db.run(
      `INSERT INTO orders (id, userId, userName, items, total, status, deliveryAddress, phone, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [orderId, null, customerName || 'B.E.C Customer', orderItemsJson, finalPrice, 'PENDING', `${address || ''}, ${city || 'Accra'}, ${region || 'Greater Accra'}`, phone || '0244122075', timestamp]
    );

    res.json({
      status: 'success',
      message: 'Bundle order placed successfully',
      orderId,
      total: finalPrice,
      savings: bundle.savings * quantity
    });
  } catch (error) {
    console.error('Error in bundle checkout:', error);
    res.status(500).json({ status: 'error', message: 'Bundle checkout failed' });
  }
});

// Admin POST /api/bundles
router.post('/', async (req, res) => {
  const { id, name, slug, description, heroImage, items, products, bundlePrice, originalPrice, savings, expiresIn, expiresAt, isActive } = req.body;
  try {
    const bId = id || 'bundle_' + crypto.randomUUID();
    const bSlug = slug || (name ? name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : bId);
    
    // Support both items structure and products array from AdminKitManager
    let itemsArr = items;
    if (!itemsArr && products) {
      itemsArr = Array.isArray(products)
        ? products.map((p: any) => typeof p === 'object' ? { productId: p.id, quantity: 1, ...p } : { productId: p, quantity: 1 })
        : [];
    }
    const itemsJson = typeof itemsArr === 'string' ? itemsArr : JSON.stringify(itemsArr || []);
    const productsJson = typeof products === 'string' ? products : JSON.stringify(products || itemsArr || []);
    
    const bPrice = Number(bundlePrice) || 0;
    let origPrice = Number(originalPrice);
    if (!origPrice && Array.isArray(products)) {
      origPrice = products.reduce((acc: number, p: any) => acc + (Number(p.originalPrice || p.price) || 0), 0);
    }
    if (!origPrice) origPrice = bPrice;

    const bSavings = savings !== undefined ? Number(savings) : Math.max(0, origPrice - bPrice);
    const expAt = expiresAt || (expiresIn ? new Date(Date.now() + Number(expiresIn) * 1000).toISOString() : null);

    await db.run(
      `REPLACE INTO bundles (id, name, slug, description, heroImage, items, products, bundlePrice, originalPrice, savings, expiresIn, expiresAt, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bId, name, bSlug, description || '', heroImage || '', itemsJson, productsJson, bPrice, origPrice, bSavings, expiresIn || null, expAt, isActive ?? 1]
    );
    res.json({ status: 'success', bundleId: bId });
  } catch (error) {
    console.error('Error saving bundle:', error);
    res.status(500).json({ status: 'error', message: 'Failed to save bundle' });
  }
});

// Admin DELETE /api/bundles/:id
router.delete('/:id', async (req, res) => {
  try {
    await db.run('DELETE FROM bundles WHERE id = ? OR slug = ?', [req.params.id, req.params.id]);
    res.json({ status: 'success' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to delete bundle' });
  }
});

export default router;
