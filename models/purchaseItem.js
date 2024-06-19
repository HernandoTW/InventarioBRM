const { DataTypes } = require('sequelize');
const sequelize = require('../database');

const PurchaseItem = sequelize.define('PurchaseItem', {
    purchaseId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    productId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    quantity: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
}, {
    timestamps: true
});

module.exports = PurchaseItem;
