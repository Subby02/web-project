const express = require('express');
const cors = require('cors');
const { getDbState } = require('./config/database');
const createSession = require('./config/session');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
const allowedOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(createSession());

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'express server is running',
  });
});

app.get('/db-status', (req, res) => {
  res.json({
    status: getDbState(),
  });
});

app.post('/echo', (req, res) => {
  res.json({
    received: req.body,
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

module.exports = app;

