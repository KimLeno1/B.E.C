import express from 'express';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import { authenticate, authenticateOrGuest } from '../middleware/auth.js';
import { db } from '../server.js';
const router = express.Router();
let aiInstance = null;
function getAI() {
    if (!aiInstance) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey)
            return null;
        aiInstance = new GoogleGenAI({ apiKey });
    }
    return aiInstance;
}
// Reuse logic from geminiService but handled on server (Gemini 3.8 Flash)
router.post('/advice', authenticate, async (req, res) => {
    const { mood, occasion } = req.body;
    const ai = getAI();
    if (!ai)
        return res.status(503).json({ error: 'AI unavailable' });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Analyze user mood '${mood}' and objective '${occasion}'. Provide an elite, provocative styling verdict for 'Closet Kraze'.`,
            config: {
                systemInstruction: "You are a Senior Style Architect for Closet Kraze, a Ghanaian luxury streetwear and archival fashion house. Your tone is confident, modern, and clinical. Focus on silhouette weight and status signaling. Max 50 words.",
            }
        });
        res.json({ text: response.text });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.post('/dream', authenticate, async (req, res) => {
    const { description } = req.body;
    const ai = getAI();
    if (!ai)
        return res.status(503).json({ error: 'AI unavailable' });
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `High-fashion editorial blueprint for Closet Kraze. Subject: ${description}. Technical streetwear, luxury avant-garde, cinematic lighting. Response must be an image generation prompt.`,
        });
        res.json({ text: response.text });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
// KRAZE STYLE PASSPORT: Generate Personal Style Signature Statement
router.post('/style-summary', authenticate, async (req, res) => {
    const { aesthetics, favoriteColors, clothingSizes, fitPreference, budgetTier, occasions } = req.body;
    const ai = getAI();
    if (!ai) {
        // Elegant deterministic fallback if AI key is absent
        const aestheticText = Array.isArray(aesthetics) && aesthetics.length ? aesthetics.join(' & ') : 'Modern Streetwear';
        const colorText = Array.isArray(favoriteColors) && favoriteColors.length ? favoriteColors.join(', ') : 'Midnight Navy & Sapphire';
        const fitText = fitPreference || 'relaxed';
        return res.json({
            summary: `A curated aesthetic centered on ${aestheticText}, accented with ${colorText} in ${fitText} silhouettes.`
        });
    }
    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: `Customer Style Passport Profile:
- Aesthetics: ${JSON.stringify(aesthetics || [])}
- Preferred Colors: ${JSON.stringify(favoriteColors || [])}
- Fit Preference: ${fitPreference || 'Oversized / Relaxed'}
- Common Occasions: ${JSON.stringify(occasions || [])}
- Budget Tier: ${budgetTier || 'all'}

Craft a sophisticated, inspiring 1-2 sentence Personal Style Signature for this Closet Kraze customer.
Highlight their unique visual identity, favorite tones, and fashion perspective. Keep under 40 words. No robotic phrasing.`,
            config: {
                systemInstruction: "You are the Chief Curator for Closet Kraze. You write concise, high-fashion editorial copy celebrating individuality and Ghanaian luxury streetwear."
            }
        });
        res.json({ summary: response.text?.trim() });
    }
    catch (err) {
        console.error("Error generating style summary:", err);
        res.json({
            summary: `An expressive identity combining ${aesthetics?.[0] || 'luxury streetwear'} with intentional craftsmanship.`
        });
    }
});
// MULTIMODAL VISUAL ENGINE: Search products by image (Gemini 3.8 Flash)
router.post('/visual-search', authenticateOrGuest, async (req, res) => {
    const { image } = req.body;
    if (!image || typeof image !== 'string') {
        return res.status(400).json({ error: 'Valid image payload is required' });
    }
    // Security: prevent payload size abuse (max 12MB base64)
    if (image.length > 12 * 1024 * 1024) {
        return res.status(413).json({ error: 'Image exceeds maximum allowed size (10MB limit). Please upload a smaller photo.' });
    }
    // Security: validate mime type
    let base64Data = image;
    let mimeType = 'image/jpeg';
    if (image.includes(';base64,')) {
        const parts = image.split(';base64,');
        mimeType = parts[0].replace('data:', '').toLowerCase();
        base64Data = parts[1];
    }
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(mimeType)) {
        return res.status(400).json({ error: 'Invalid image format. Supported formats: JPEG, PNG, WEBP.' });
    }
    const ai = getAI();
    if (!ai)
        return res.status(503).json({ error: 'AI visual engine temporarily unavailable. Please try again shortly.' });
    try {
        // 1. Fetch real products from database for grounding
        const products = await db.all('SELECT id, name, category, brand, description, tags, price, inStock, stockCount FROM products');
        const catalogProducts = products.map(p => {
            let parsedTags = [];
            try {
                parsedTags = p.tags ? JSON.parse(p.tags) : [];
            }
            catch (e) {
                parsedTags = p.tags ? [p.tags] : [];
            }
            return {
                id: p.id,
                name: p.name,
                category: p.category || '',
                brand: p.brand || '',
                price: p.price,
                inStock: !!p.inStock && (p.stockCount === undefined || p.stockCount > 0),
                description: p.description || '',
                tags: parsedTags
            };
        });
        const imagePart = {
            inlineData: {
                mimeType: mimeType,
                data: base64Data
            }
        };
        const textPart = {
            text: `You are the Visual Fashion Search Engine for Closet Kraze.
Analyze this fashion photo and extract detailed visual attributes:
1. garmentCategory (e.g. Hoodies, Graphic Tees, Cargo Pants, Sneakers, Crossbody Bags, Jackets, Sets)
2. colours (array of observed dominant and accent colors)
3. silhouette (e.g. Oversized, Boxy, Tailored, Chunky, Wide-leg, Cropped, Minimalist)
4. pattern (e.g. Solid, Monogram, Acid Wash, Striped, Distressed, Colorblock, Graphic Print)
5. styleCharacteristics (e.g. Luxury Streetwear, Y2K, Techwear, Vintage Archival, Avant-Garde)
6. visualAttributes (array of specific design details like zippers, drawstrings, embroidery, hardware, texture)

CRITICAL INVENTORY RULE:
Below is our verified store inventory:
${JSON.stringify(catalogProducts, null, 2)}

Match the photo against ONLY actual products from this list. Return the top 4 candidate products by their exact 'id', with a confidence score (0.0 to 1.0) and a brief customer-facing explanation of why this piece matches (e.g., 'Matches the oversized boxy cut and dark wash of the denim in your photo').
NEVER invent product IDs or names outside this catalog.`
        };
        // Use Gemini 3.8 Flash multimodal
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents: [imagePart, textPart],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        garmentCategory: { type: Type.STRING },
                        colours: { type: Type.ARRAY, items: { type: Type.STRING } },
                        silhouette: { type: Type.STRING },
                        pattern: { type: Type.STRING },
                        styleCharacteristics: { type: Type.STRING },
                        visualAttributes: { type: Type.ARRAY, items: { type: Type.STRING } },
                        matches: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    productId: { type: Type.STRING },
                                    confidence: { type: Type.NUMBER, description: "Matching confidence from 0.0 to 1.0" },
                                    reasoning: { type: Type.STRING, description: "Clear visual matching rationale" }
                                },
                                required: ["productId", "confidence", "reasoning"]
                            }
                        }
                    },
                    required: ["garmentCategory", "colours", "silhouette", "matches"]
                }
            }
        });
        const rawResultText = (response.text || '{}').trim();
        let resultObj = { matches: [], colours: [], garmentCategory: '', silhouette: '' };
        try {
            const cleanJson = rawResultText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            resultObj = JSON.parse(cleanJson);
        }
        catch (e) {
            console.error('Failed to parse Gemini visual search response:', e, rawResultText);
        }
        const matches = Array.isArray(resultObj.matches) ? resultObj.matches : [];
        // 3. Strict Server-Side Validation: Verify every matched productId against SQLite
        const candidateIds = matches.map((m) => m.productId).filter(Boolean);
        let validatedProducts = [];
        if (candidateIds.length > 0) {
            const placeholders = candidateIds.map(() => '?').join(',');
            const rows = await db.all(`SELECT * FROM products WHERE id IN (${placeholders})`, candidateIds);
            validatedProducts = rows.map((p) => {
                try {
                    p.tags = p.tags ? JSON.parse(p.tags) : [];
                }
                catch (e) {
                    p.tags = p.tags ? [p.tags] : [];
                }
                try {
                    p.images = p.images ? JSON.parse(p.images) : [];
                }
                catch (e) {
                    p.images = [];
                }
                try {
                    const d = p.details ? JSON.parse(p.details) : [];
                    p.details = Array.isArray(d) ? d.map(x => typeof x === "object" && x !== null ? (x.key && x.value ? `${x.key}: ${x.value}` : (x.value || x.key || JSON.stringify(x))) : String(x)) : [];
                }
                catch (e) {
                    p.details = [];
                }
                try {
                    p.sizes = p.sizes ? JSON.parse(p.sizes) : [];
                }
                catch (e) {
                    p.sizes = [];
                }
                try {
                    p.colors = p.colors ? JSON.parse(p.colors) : [];
                }
                catch (e) {
                    p.colors = [];
                }
                try {
                    p.colorVariants = p.colorVariants ? JSON.parse(p.colorVariants) : [];
                }
                catch (e) {
                    p.colorVariants = [];
                }
                try {
                    p.priceRange = p.priceRange ? JSON.parse(p.priceRange) : null;
                }
                catch (e) {
                    p.priceRange = null;
                }
                try {
                    p.customizationFields = p.customizationFields ? JSON.parse(p.customizationFields) : [];
                }
                catch (e) {
                    p.customizationFields = [];
                }
                return p;
            });
        }
        // Build verified response with only authentic database inventory
        const verifiedMatches = matches
            .map((m) => {
            const fullProd = validatedProducts.find(p => p.id === m.productId);
            if (!fullProd)
                return null;
            return {
                productId: fullProd.id,
                confidence: m.confidence || 0.85,
                reasoning: m.reasoning || `Matches the ${resultObj.silhouette || ''} ${resultObj.garmentCategory || 'aesthetic'}.`,
                product: fullProd
            };
        })
            .filter(Boolean);
        res.json({
            success: true,
            analysis: {
                category: resultObj.garmentCategory || 'Apparel',
                colours: resultObj.colours || [],
                silhouette: resultObj.silhouette || 'Contemporary',
                pattern: resultObj.pattern || 'Solid',
                styleCharacteristics: resultObj.styleCharacteristics || 'Streetwear',
                visualAttributes: resultObj.visualAttributes || []
            },
            matches: verifiedMatches
        });
    }
    catch (err) {
        console.error("Visual search error details:", err);
        res.status(500).json({ error: err.message || 'Failed to complete visual search analysis' });
    }
});
// ==========================================
// KRAZE LOOK LAB — AI FASHION OUTFIT ARCHITECT (GEMINI 3.8 FLASH)
// ==========================================
router.post('/look-lab', authenticate, async (req, res) => {
    const { intention, prompt, occasion, budget, targetProductId, inspirationImage, userPassport } = req.body;
    const ai = getAI();
    if (!ai)
        return res.status(503).json({ error: 'AI unavailable' });
    try {
        const products = await db.all('SELECT id, name, category, brand, description, tags, price, image, inStock, stockCount FROM products');
        const catalog = products.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category || 'Apparel',
            brand: p.brand || '',
            price: p.price,
            image: p.image,
            inStock: !!p.inStock && (p.stockCount === undefined || p.stockCount > 0),
            description: p.description || '',
        }));
        let targetProduct = null;
        if (targetProductId) {
            const tp = products.find(p => p.id === targetProductId);
            if (tp)
                targetProduct = tp;
        }
        let imagePart = null;
        if (inspirationImage && inspirationImage.includes(';base64,')) {
            const parts = inspirationImage.split(';base64,');
            imagePart = {
                inlineData: {
                    mimeType: parts[0].replace('data:', ''),
                    data: parts[1]
                }
            };
        }
        const systemPrompt = `You are the Lead Fashion Outfit Architect for 'Closet Kraze', an elite luxury streetwear and archival fashion house.
Your task is to curate complete, visually harmonious outfits using ONLY authentic items from our catalog.
Every outfit must contain compatible pieces across categories (e.g. Outerwear, Tops, Bottoms, Footwear, Accessories).
Never fabricate product IDs or prices. Return valid JSON matching the schema.`;
        const userPromptText = `Intention: ${intention || 'style_me'}
User Prompt: ${prompt || ''}
Occasion: ${occasion || 'General streetwear & luxury'}
Budget Limit: ${budget ? `GH₵${budget}` : 'No strict limit'}
Target Product: ${targetProduct ? JSON.stringify(targetProduct) : 'None'}
User Style Passport: ${userPassport ? JSON.stringify(userPassport) : 'None'}

Available Catalog Inventory:
${JSON.stringify(catalog, null, 2)}

Task:
1. Select the best matching items from the catalog inventory to fulfill the intention.
2. Ensure realistic pricing and category diversity.
3. Provide a compelling styling verdict / explanation.
4. If intention is 'three_way_styling', provide 3 distinct style directions (Minimal & Elegant, Bold & Expressive, Everyday Casual) with item lists.`;
        const contents = imagePart ? [imagePart, { text: userPromptText }] : [userPromptText];
        const response = await ai.models.generateContent({
            model: "gemini-3.8-flash",
            contents,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        outfitName: { type: Type.STRING },
                        stylingVerdict: { type: Type.STRING },
                        totalPrice: { type: Type.NUMBER },
                        items: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    productId: { type: Type.STRING },
                                    role: { type: Type.STRING, description: "e.g. Outerwear, Tops, Bottoms, Footwear, Accessories" },
                                    reasoning: { type: Type.STRING }
                                },
                                required: ["productId", "role", "reasoning"]
                            }
                        },
                        alternatives: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    productId: { type: Type.STRING },
                                    role: { type: Type.STRING },
                                    reasoning: { type: Type.STRING }
                                },
                                required: ["productId", "role", "reasoning"]
                            }
                        },
                        stylingDirections: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    description: { type: Type.STRING },
                                    productIds: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["title", "description", "productIds"]
                            }
                        }
                    },
                    required: ["outfitName", "stylingVerdict", "items"]
                }
            }
        });
        const rawText = (response.text || '{}').trim();
        let resultObj = {};
        try {
            const clean = rawText.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
            resultObj = JSON.parse(clean);
        }
        catch (e) {
            console.error('Failed to parse Look Lab AI JSON:', e, rawText);
            throw new Error('AI returned invalid JSON structure');
        }
        const hydrateItem = (item) => {
            const p = products.find(x => x.id === item.productId);
            if (!p)
                return null;
            try {
                p.tags = p.tags ? JSON.parse(p.tags) : [];
            }
            catch { }
            try {
                p.images = p.images ? JSON.parse(p.images) : [];
            }
            catch {
                p.images = [];
            }
            try {
                p.sizes = p.sizes ? JSON.parse(p.sizes) : [];
            }
            catch {
                p.sizes = [];
            }
            try {
                p.colors = p.colors ? JSON.parse(p.colors) : [];
            }
            catch {
                p.colors = [];
            }
            return {
                ...item,
                product: p
            };
        };
        const hydratedItems = (resultObj.items || []).map(hydrateItem).filter(Boolean);
        const hydratedAlternatives = (resultObj.alternatives || []).map(hydrateItem).filter(Boolean);
        const hydratedDirections = (resultObj.stylingDirections || []).map((dir) => ({
            ...dir,
            products: (dir.productIds || []).map((id) => products.find(p => p.id === id)).filter(Boolean)
        }));
        const calculatedTotal = hydratedItems.reduce((acc, curr) => acc + (curr.product?.price || 0), 0);
        res.json({
            success: true,
            outfit: {
                name: resultObj.outfitName || 'Curated Kraze Look',
                verdict: resultObj.stylingVerdict || 'An exceptional blend of texture and silhouette.',
                totalPrice: calculatedTotal > 0 ? calculatedTotal : (resultObj.totalPrice || 0),
                items: hydratedItems,
                alternatives: hydratedAlternatives,
                stylingDirections: hydratedDirections
            }
        });
    }
    catch (err) {
        console.error('Look Lab error:', err);
        res.status(500).json({ error: err.message || 'Look Lab generation failed' });
    }
});
// ==========================================
// VIRTUAL TRY-ON (VTON) VIA GRADIO / HF
// ==========================================
const MODEL_AVATARS = [
    {
        id: 'avatar_model_1',
        name: 'Streetwear Minimalist',
        label: 'Male / Unisex',
        imageUrl: '/hero/hero_model_freedom_1788236993279.jpg'
    },
    {
        id: 'avatar_model_2',
        name: 'Contemporary Editorial',
        label: 'Female / Unisex',
        imageUrl: '/hero/hero_model_identity_1788237069856.jpg'
    },
    {
        id: 'avatar_model_3',
        name: 'Avant-Garde Silhouette',
        label: 'Editorial',
        imageUrl: '/hero/hero_model_gallery_1788237022752.jpg'
    },
    {
        id: 'avatar_model_4',
        name: 'High-Fashion Tailored',
        label: 'Urban Modern',
        imageUrl: '/hero/hero_model_harder_1788237010924.jpg'
    }
];
// Return preset model avatars for instant 1-click try-on testing
router.get('/tryon/avatars', (req, res) => {
    res.json({
        success: true,
        avatars: MODEL_AVATARS
    });
});
// Perform AI Virtual Try-On using Hugging Face Space Gradio API
router.post('/tryon', authenticateOrGuest, async (req, res) => {
    const { personImage, garmentImage, garmentDescription = 'Luxury archival fashion garment', denoiseSteps = 30, seed = 42 } = req.body;
    if (!personImage || !garmentImage) {
        return res.status(400).json({
            error: 'Both personImage and garmentImage are required for virtual try-on.'
        });
    }
    // Security: check payload sizes (max 12MB base64 per image to prevent memory exhaustion)
    if (typeof personImage === 'string' && personImage.length > 12 * 1024 * 1024) {
        return res.status(413).json({ error: 'Person photo exceeds 10MB limit. Please upload a smaller image.' });
    }
    if (typeof garmentImage === 'string' && garmentImage.length > 12 * 1024 * 1024) {
        return res.status(413).json({ error: 'Garment image exceeds 10MB limit.' });
    }
    // IDM-VTON expects denoise steps >= 20 and <= 40
    const steps = Math.min(40, Math.max(20, Number(denoiseSteps) || 30));
    const safeSeed = Math.floor(Math.abs(Number(seed) || 42));
    // Ensure tryon upload directory exists
    const tryonDir = path.resolve('public/uploads/tryon');
    if (!fs.existsSync(tryonDir)) {
        try {
            fs.mkdirSync(tryonDir, { recursive: true });
        }
        catch { }
    }
    let tempPersonFile = null;
    let tempGarmentFile = null;
    try {
        const { Client, handle_file } = await import('@gradio/client');
        // Read Hugging Face token strictly from server environment without fallback hardcoded secrets
        const hfToken = (process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || '').trim();
        // Connect to yisol/IDM-VTON Gradio space (use authenticated token if provided for prioritized GPU queue)
        const connectOptions = hfToken ? { token: hfToken } : {};
        const app = await Client.connect('yisol/IDM-VTON', connectOptions);
        // 1. Process person image
        let humanInput;
        if (typeof personImage === 'string' && personImage.startsWith('data:')) {
            const parts = personImage.split(';base64,');
            const base64Data = parts.length > 1 ? parts[1] : personImage.replace(/^data:image\/[a-z]+;base64,/, '');
            const ext = personImage.includes('png') ? 'png' : 'jpg';
            const tempName = `temp_person_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
            tempPersonFile = path.join(tryonDir, tempName);
            fs.writeFileSync(tempPersonFile, Buffer.from(base64Data, 'base64'));
            humanInput = handle_file(tempPersonFile);
        }
        else if (typeof personImage === 'string' && (personImage.startsWith('/') || personImage.startsWith('./'))) {
            const cleanPath = personImage.replace(/^\.?\//, '');
            const possibleDiskPaths = [
                path.resolve(cleanPath),
                path.resolve('public', cleanPath),
                path.resolve('public', cleanPath.replace(/^hero\//, 'hero/'))
            ];
            const diskPath = possibleDiskPaths.find(p => fs.existsSync(p));
            if (diskPath) {
                humanInput = handle_file(diskPath);
            }
            else {
                humanInput = handle_file(personImage);
            }
        }
        else {
            humanInput = handle_file(personImage);
        }
        // 2. Process garment image
        let garmentInput;
        if (typeof garmentImage === 'string' && garmentImage.startsWith('data:')) {
            const parts = garmentImage.split(';base64,');
            const base64Data = parts.length > 1 ? parts[1] : garmentImage.replace(/^data:image\/[a-z]+;base64,/, '');
            const ext = garmentImage.includes('png') ? 'png' : 'jpg';
            const tempName = `temp_garm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
            tempGarmentFile = path.join(tryonDir, tempName);
            fs.writeFileSync(tempGarmentFile, Buffer.from(base64Data, 'base64'));
            garmentInput = handle_file(tempGarmentFile);
        }
        else if (typeof garmentImage === 'string' && (garmentImage.startsWith('/') || garmentImage.startsWith('./'))) {
            const cleanPath = garmentImage.replace(/^\.?\//, '');
            const possibleDiskPaths = [
                path.resolve(cleanPath),
                path.resolve('public', cleanPath)
            ];
            const diskPath = possibleDiskPaths.find(p => fs.existsSync(p));
            if (diskPath) {
                garmentInput = handle_file(diskPath);
            }
            else {
                garmentInput = handle_file(garmentImage);
            }
        }
        else {
            garmentInput = handle_file(garmentImage);
        }
        // 3. Submit prediction to Gradio /tryon endpoint
        console.log(`[VTON] Submitting try-on request to yisol/IDM-VTON (steps: ${steps}, seed: ${safeSeed})...`);
        const result = await app.predict('/tryon', [
            { background: humanInput, layers: [], composite: null },
            garmentInput,
            String(garmentDescription || 'Clothing piece'),
            true, // is_checked (auto-masking enabled)
            false, // is_checked_crop
            steps,
            safeSeed
        ]);
        if (!result || !result.data || !result.data[0]) {
            throw new Error('No output image returned from Gradio Space');
        }
        const outputData = result.data[0];
        let outputUrl = '';
        if (typeof outputData === 'string') {
            outputUrl = outputData;
        }
        else if (outputData && typeof outputData === 'object' && outputData.url) {
            outputUrl = outputData.url;
        }
        else if (outputData && typeof outputData === 'object' && outputData.path) {
            outputUrl = outputData.path;
        }
        // 4. Cache result locally if URL is accessible
        let localResultUrl = outputUrl;
        if (outputUrl && outputUrl.startsWith('http')) {
            try {
                const fetchRes = await fetch(outputUrl);
                if (fetchRes.ok) {
                    const buffer = await fetchRes.arrayBuffer();
                    const fileName = `vton_result_${Date.now()}_${Math.random().toString(36).substring(2, 6)}.jpg`;
                    const savePath = path.join(tryonDir, fileName);
                    fs.writeFileSync(savePath, Buffer.from(buffer));
                    localResultUrl = `/uploads/tryon/${fileName}`;
                }
            }
            catch (cacheErr) {
                console.warn('[VTON] Failed to cache local copy, falling back to remote URL:', cacheErr);
            }
        }
        console.log('[VTON] Try-on generated successfully:', localResultUrl);
        res.json({
            success: true,
            resultUrl: localResultUrl,
            remoteUrl: outputUrl,
            model: 'IDM-VTON (Gradio Free API)',
            denoiseSteps: steps
        });
    }
    catch (err) {
        console.error('[VTON Error]:', err.message || err);
        const isQueueError = err.message?.includes('queue') || err.message?.includes('timeout') || err.message?.includes('busy');
        res.status(502).json({
            success: false,
            error: isQueueError
                ? 'The Hugging Face IDM-VTON server queue is currently busy. Please wait a moment and try again.'
                : (err.message || 'Virtual Try-On generation encountered an error'),
            details: 'Optionally configure HF_TOKEN in your environment for priority GPU processing.'
        });
    }
    finally {
        // Guaranteed temporary file cleanup to prevent disk accumulation and protect user privacy
        if (tempPersonFile && fs.existsSync(tempPersonFile)) {
            try {
                fs.unlinkSync(tempPersonFile);
            }
            catch { }
        }
        if (tempGarmentFile && fs.existsSync(tempGarmentFile)) {
            try {
                fs.unlinkSync(tempGarmentFile);
            }
            catch { }
        }
    }
});
// Privacy Compliance: Allow customers to delete generated try-on previews
router.delete('/tryon/result/:fileName', authenticateOrGuest, async (req, res) => {
    const fileName = String(req.params.fileName || '');
    if (!fileName || fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
        return res.status(400).json({ error: 'Invalid file reference' });
    }
    const filePath = path.join(process.cwd(), 'public/uploads/tryon', fileName);
    try {
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            return res.json({ success: true, message: 'Try-on preview removed from server storage.' });
        }
        res.status(404).json({ error: 'File not found' });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete file' });
    }
});
export default router;
