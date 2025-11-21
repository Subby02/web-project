const express = require('express');
const cors = require('cors');
const { getDbState } = require('./config/database');
const createSession = require('./config/session');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');

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

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

module.exports = app;

