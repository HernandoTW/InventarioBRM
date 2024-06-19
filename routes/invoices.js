
const express = require('express');
const router = express.Router();
const { Purchase, PurchaseItem, Product } = require('../models');
const { ensureAuthenticated } = require('../middleware/auth');

router.get('/', ensureAuthenticated, async (req, res) => {
    const purchases = await Purchase.findAll({ where: { userId: req.user.id }, include: [{ model: PurchaseItem, include: [Product] }] });
    res.render('invoices', { invoices: purchases });
});

module.exports = router;
