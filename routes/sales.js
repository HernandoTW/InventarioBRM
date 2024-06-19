const express = require('express');
const router = express.Router();
const { Purchase, PurchaseItem, Product, User } = require('../models');
const { ensureAuthenticated, ensureAdmin } = require('../middleware/auth');

router.use(ensureAuthenticated);
router.use(ensureAdmin);

router.get('/', async (req, res) => {
    const sales = await Purchase.findAll({ include: [{ model: PurchaseItem, include: Product }, User] });
    res.render('sales', { sales });
});

module.exports = router;
