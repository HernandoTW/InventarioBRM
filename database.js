// database.js

const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('inventario', 'root', null, {
  host: '127.0.0.1',
  dialect: 'mysql'
});

module.exports = sequelize;
