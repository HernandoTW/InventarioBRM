const Sequelize = require('sequelize');
const sequelize = require('../database');

const User = require('./user');
const Product = require('./product');
const Purchase = require('./purchase');
const PurchaseItem = require('./purchaseItem');

User.hasMany(Purchase, { foreignKey: 'userId' });
Purchase.belongsTo(User, { foreignKey: 'userId' });

Purchase.hasMany(PurchaseItem, { foreignKey: 'purchaseId' });
PurchaseItem.belongsTo(Purchase, { foreignKey: 'purchaseId' });

Product.hasMany(PurchaseItem, { foreignKey: 'productId' });
PurchaseItem.belongsTo(Product, { foreignKey: 'productId' });

sequelize.sync();

module.exports = { User, Product, Purchase, PurchaseItem, sequelize };
