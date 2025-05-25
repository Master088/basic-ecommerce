const { Product, Category } = require('../models');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
// Create a product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      discountedPrice,
      categoryId,
      description,
      stock
    } = req.body;

    let imagePath = null;

    if (req.file) {
      imagePath = `/uploads/products/${req.file.filename}`;
    }

    const product = await Product.create({
      name,
      price,
      discountedPrice,
      categoryId,
      description,
      stock,
      image: imagePath
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all products
exports.getProducts = async (req, res) => {
  try {
    const {
      search,
      categoryId,
      minPrice,
      maxPrice,
      inStock,
      sort,
    } = req.query;

    const whereClause = {};

    if (search) {
      whereClause.name = {
        [Op.like]: `%${search}%`,
      };
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    if (inStock === 'true') {
      whereClause.stock = { [Op.gt]: 0 };
    }

    const order = [];
    if (sort === 'price_asc') order.push(['price', 'ASC']);
    if (sort === 'price_desc') order.push(['price', 'DESC']);

    const products = await Product.findAll({
      where: whereClause,
      include: [{ model: Category, as: 'category' }],
      order,
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get single product by ID
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const {
      name,
      price,
      discountedPrice,
      categoryId,
      description,
      stock
    } = req.body;

    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Remove old image if a new one is uploaded
    if (req.file) {
      if (product.image) {
        const oldImagePath = path.join(__dirname, '..', 'uploads', 'products', path.basename(product.image));
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      product.image = `/uploads/products/${req.file.filename}`;
    }

    // Update fields
    product.name = name || product.name;
    product.price = price || product.price;
    product.discountedPrice = discountedPrice || product.discountedPrice;
    product.categoryId = categoryId || product.categoryId;
    product.description = description || product.description;
    product.stock = stock || product.stock;

    await product.save();

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ error: 'Not found' });

    // Remove image from disk
    if (product.image) {
      const imagePath = path.join(__dirname, '..', 'uploads', 'products', path.basename(product.image));
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await Product.destroy({ where: { id: req.params.id } });

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
