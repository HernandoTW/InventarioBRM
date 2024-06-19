const { DataTypes } = require('sequelize');
const sequelize = require('../database');
const User = require('./user');

const Purchase = sequelize.define('Purchase', {
    userId: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'id'
        }
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    total: {
        type: DataTypes.FLOAT,
        allowNull: false
    }
});

module.exports = Purchase;
