const express = require('express');
const router = express.Router();
const { Product } = require('../models');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

router.use(ensureAuthenticated);
router.use(ensureAdmin);

router.get('/', async (req, res) => {
    const products = await Product.findAll();
    res.render('products', { products });
});

router.post('/', async (req, res) => {
    const { lotNumber, name, price, quantityAvailable, entryDate } = req.body;
    await Product.create({ lotNumber, name, price, quantityAvailable, entryDate });
    res.redirect('/products');
});

router.post('/:id/delete', async (req, res) => {
    const { id } = req.params;
    await Product.destroy({ where: { id } });
    res.redirect('/products');
});

module.exports = router;
