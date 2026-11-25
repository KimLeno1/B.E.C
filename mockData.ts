import { Product, Bundle, PriceAnomaly, Order, OrderStatus } from './types';
import { MOCK_PRODUCTS } from './constants';

export const EXTENDED_PRODUCTS: Product[] = MOCK_PRODUCTS.map((p, idx) => ({
  ...p,
  velocityScore: 78 + idx * 4,
}));

export const MOCK_BUNDLES: Bundle[] = [
  {
    id: 'bundle_bec_slide_duo',
    name: 'Classic & Studded Slide Duo',
    description: 'Pair the Ivory Crest Classic Slides with our Onyx Pyramid Studded H-Strap Slides for effortless day-to-night rotation.',
    products: [EXTENDED_PRODUCTS[2], EXTENDED_PRODUCTS[1]],
    bundlePrice: 560,
    expiresIn: 3600,
  },
  {
    id: 'bundle_bec_clog_duo',
    name: 'All-Terrain & Designer Clog Set',
    description: 'Two sculpted clog silhouettes—Khaki All-Terrain Clogs plus Obsidian Designer Clogs—bundled with nationwide delivery.',
    products: [EXTENDED_PRODUCTS[0], EXTENDED_PRODUCTS[4]],
    bundlePrice: 710,
    expiresIn: 7200,
  },
];

export const MOCK_PRICE_ANOMALIES: PriceAnomaly[] = [
  {
    ...EXTENDED_PRODUCTS[1],
    productId: EXTENDED_PRODUCTS[1].id,
    anomalyEndTime: Date.now() + 900000,
    discountPercent: 20,
  },
];

export const MOCK_ORDERS: Order[] = [
  {
    id: 'BEC-1042-GH',
    userId: 'u1',
    userName: 'Kwame Mensah',
    items: [{ ...EXTENDED_PRODUCTS[0], quantity: 1, selectedSize: '42' }],
    total: 380,
    status: OrderStatus.PROCESSING,
    timestamp: '2026-11-20T14:22:00Z',
    deliveryAddress: 'East Legon, Accra, Ghana',
  },
  {
    id: 'BEC-1039-GH',
    userId: 'u2',
    userName: 'Abena Osei',
    items: [
      { ...EXTENDED_PRODUCTS[1], quantity: 1, selectedSize: '40' },
      { ...EXTENDED_PRODUCTS[3], quantity: 1, selectedSize: '39' },
    ],
    total: 700,
    status: OrderStatus.SHIPPED,
    timestamp: '2026-11-19T09:45:00Z',
    trackingNumber: 'BEC-GH-88412',
    deliveryAddress: 'Ahodwo, Kumasi, Ashanti Region',
  },
  {
    id: 'BEC-1031-GH',
    userId: 'u3',
    userName: 'Kofi Boateng',
    items: [{ ...EXTENDED_PRODUCTS[4], quantity: 1, selectedSize: '43' }],
    total: 420,
    status: OrderStatus.DELIVERED,
    timestamp: '2026-11-18T18:30:00Z',
    trackingNumber: 'BEC-GH-88109',
    deliveryAddress: 'Takoradi Market Circle, Western Region',
  },
];
