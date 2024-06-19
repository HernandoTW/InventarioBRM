// app.js

const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { sequelize, User, Product } = require('./models');
const path = require('path');
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'secreto',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Configuración de Passport
passport.use(new LocalStrategy(
  async function(username, password, done) {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return done(null, false, { message: 'Nombre de usuario incorrecto.' });
      }
      if (user.password !== password) {
        return done(null, false, { message: 'Contraseña incorrecta.' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware para verificar si el usuario es administrador
function isAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Middleware para verificar si el usuario es cliente
function isClient(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'cliente') {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect('/login');
  }
}

// Rutas
app.post('/login', passport.authenticate('local', {
  successRedirect: '/welcome',
  failureRedirect: '/login',
  failureFlash: true
}));

app.get('/welcome', isAuthenticated, (req, res) => {
  res.render('welcome', { user: req.user });
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/login');
  });
});

// Rutas CRUD para productos (solo administradores)
app.get('/products', isAdmin, async (req, res) => {
  const products = await Product.findAll();
  res.render('products', { products });
});

app.post('/products', isAdmin, async (req, res) => {
  const { lotNumber, name, price, quantityAvailable, entryDate } = req.body;
  await Product.create({ lotNumber, name, price, quantityAvailable, entryDate });
  res.redirect('/products');
});


/*
app.post('/products/:id/update', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { lotNumber, name, price, quantityAvailable, entryDate } = req.body;
  await Product.update({ lotNumber, name, price, quantityAvailable, entryDate }, { where: { id } });
  res.redirect('/products');
});
*/


app.post('/products/:id/update', isAdmin, async (req, res) => {
  const { id } = req.params;
  const { lotNumber, name, price, quantityAvailable, entryDate } = req.body;
  
  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).send('Producto no encontrado.');
    }

    // Actualizar los campos del producto
    product.lotNumber = lotNumber;
    product.name = name;
    product.price = price;
    product.quantityAvailable = quantityAvailable;
    product.entryDate = entryDate;

    await product.save(); // Guardar los cambios en la base de datos

    res.redirect('/products'); // Redirigir de vuelta a la lista de productos
  } catch (error) {
    console.error('Error al actualizar el producto:', error);
    res.status(500).send('Error interno al actualizar el producto.');
  }
});



app.post('/products/:id/delete', isAdmin, async (req, res) => {
  const { id } = req.params;
  await Product.destroy({ where: { id } });
  res.redirect('/products');
});

// Inicia el servidor
const PORT = process.env.PORT || 3000;
sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en puerto ${PORT}`);
  });
});


const sales = [];  // Array para simular las ventas (en un escenario real esto debería ser gestionado en la base de datos)
const cart = [];  // Array para simular el carrito de compras

// Rutas para el módulo de compras (solo clientes)
app.get('/shop', isClient, async (req, res) => {
  const products = await Product.findAll();
  res.render('shop', { products, cart });
});

app.post('/shop', isClient, (req, res) => {
  const { product, quantity } = req.body;
  const selectedProduct = Product.findByPk(product);
  cart.push({ product: selectedProduct, quantity: parseInt(quantity) });
  res.redirect('/shop');
});

app.post('/checkout', isClient, (req, res) => {
  const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  sales.push({ client: req.user.username, date: new Date(), products: cart, total });
  cart.length = 0;  // Vaciar el carrito
  res.redirect('/invoices');
});

app.get('/invoices', isClient, (req, res) => {
  const invoices = sales.filter(sale => sale.client === req.user.username);
  res.render('invoices', { invoices });
});

app.get('/sales', isAdmin, (req, res) => {
  res.render('sales', { sales });
});

