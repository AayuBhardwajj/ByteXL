const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json());

// ✅ Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/productDB')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

// ✅ Define Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  stock: Number
});

// ✅ Create Product Model
const Product = mongoose.model('Product', productSchema);

// ✅ CRUD Routes

// Create Product
app.post('/products', async (req, res) => {
  const product = new Product(req.body);
  await product.save();
  res.send(product);
});

// Read All Products
app.get('/products', async (req, res) => {
  const products = await Product.find();
  res.send(products);
});

// Read Single Product
app.get('/products/:id', async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.send(product);
});

// Update Product
app.put('/products/:id', async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.send(product);
});

// Delete Product
app.delete('/products/:id', async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.send({ message: 'Product Deleted' });
});

app.listen(3000, () => console.log('Server running on port 3000'));
