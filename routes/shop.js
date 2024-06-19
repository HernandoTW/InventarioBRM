const express = require('express');
const router = express.Router();
const { Product, Purchase, PurchaseItem } = require('../models');
const { ensureAuthenticated, ensureClient } = require('../middleware/auth');

router.use(ensureAuthenticated);
router.use(ensureClient);

router.get('/', async (req, res) => {
    const products = await Product.findAll();
    const cart = req.session.cart || [];
    res.render('shop', { products, cart });
});

router.post('/', async (req, res) => {
    const { product, quantity } = req.body;
    const productData = await Product.findByPk(product);

    const cartItem = {
        product: productData.name,
        productId: productData.id,
        quantity: parseInt(quantity, 10),
        price: productData.price * quantity
    };

    req.session.cart = req.session.cart || [];
    req.session.cart.push(cartItem);
    res.redirect('/shop');
});

router.post('/checkout', async (req, res) => {
    const userId = req.user.id;
    const cart = req.session.cart || [];

    if (cart.length === 0) {
        return res.redirect('/shop');
    }

    const purchase = await Purchase.create({ userId, date: new Date(), total: cart.reduce((sum, item) => sum + item.price, 0) });

    for (const item of cart) {
        await PurchaseItem.create({
            purchaseId: purchase.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price
        });

        const product = await Product.findByPk(item.productId);
        product.quantityAvailable -= item.quantity;
        await product.save();
    }

    req.session.cart = [];
    res.redirect('/invoices');
});

module.exports = router;
