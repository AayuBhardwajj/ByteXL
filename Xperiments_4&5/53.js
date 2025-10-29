/**
 * catalogApp.js
 * Single-file E-commerce Catalog (nested documents)
 *
 * Usage:
 * 1. npm init -y
 * 2. npm install express mongoose
 * 3. node catalogApp.js
 *
 * Endpoints:
 * POST   /products           -> create product (body contains nested 'details' & 'reviews' optionally)
 * GET    /products           -> list products (supports ?category=... & pagination ?page=&limit=)
 * GET    /products/:id       -> get product by id
 * PUT    /products/:id       -> update product (can update nested fields)
 * DELETE /products/:id       -> delete product
 * POST   /products/:id/reviews -> push a new review to reviews array
 */

const express = require('express');
const mongoose = require('mongoose');

const app = express();
app.use(express.json());

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerceDB';
const PORT = process.env.PORT || 4000;

// ---------- CONNECT ----------
mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ MongoDB connected (ecommerceDB)'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// ---------- PRODUCT SCHEMA (Nested) ----------
const reviewSchema = new mongoose.Schema({
  user: { type: String, required: true },
  comment: String,
  rating: { type: Number, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
}, { _id: true });

const specSchema = new mongoose.Schema({
  color: String,
  weight: String,
  dimensions: String,
  extras: mongoose.Schema.Types.Mixed // flexible for additional spec fields
}, { _id: false });

const detailsSchema = new mongoose.Schema({
  brand: String,
  model: String,
  specifications: specSchema
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, index: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, default: 0 },
  tags: [String],
  details: detailsSchema,      // nested doc
  attributes: mongoose.Schema.Types.Mixed, // flexible nested object
  reviews: [reviewSchema],     // array of nested docs
  createdAt: { type: Date, default: Date.now }
});

productSchema.index({ name: 'text', category: 1, 'details.brand': 1 });

// ---------- MODEL ----------
const Product = mongoose.model('Product', productSchema);

// ---------- CONTROLLER-LIKE HELPERS ----------
async function createProduct(data) {
  const p = new Product(data);
  return await p.save();
}

async function listProducts(filter = {}, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const q = Product.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
  const items = await q.exec();
  const total = await Product.countDocuments(filter);
  return { items, total, page, limit };
}

async function getProduct(id) {
  return await Product.findById(id);
}

async function updateProduct(id, data) {
  // Use { new: true, runValidators: true } to return updated doc and validate
  return await Product.findByIdAndUpdate(id, data, { new: true, runValidators: true });
}

async function removeProduct(id) {
  return await Product.findByIdAndDelete(id);
}

async function addReview(productId, review) {
  const p = await Product.findById(productId);
  if (!p) throw new Error('Product not found');
  p.reviews.push(review);
  await p.save();
  return p;
}

// ---------- ROUTES ----------
app.post('/products', async (req, res) => {
  try {
    const product = await createProduct(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// list with optional filters: category, minPrice, maxPrice, tag, text search (q)
app.get('/products', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, tag, q, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (minPrice || maxPrice) filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
    if (tag) filter.tags = tag;
    if (q) filter.$text = { $search: q };

    const data = await listProducts(filter, parseInt(page), parseInt(limit));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/products/:id', async (req, res) => {
  try {
    const p = await getProduct(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

app.put('/products/:id', async (req, res) => {
  try {
    const p = await updateProduct(req.params.id, req.body);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const p = await removeProduct(req.params.id);
    if (!p) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: 'Invalid ID' });
  }
});

// add a review to product
app.post('/products/:id/reviews', async (req, res) => {
  try {
    const review = {
      user: req.body.user || 'anonymous',
      comment: req.body.comment,
      rating: req.body.rating
    };
    const p = await addReview(req.params.id, review);
    res.json(p);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// health
app.get('/', (req, res) => res.json({ ok: true, service: 'Ecommerce Catalog' }));

// ---------- START ----------
app.listen(PORT, () => console.log(`🚀 Catalog app listening on http://localhost:${PORT}`));
