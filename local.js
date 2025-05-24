// local.js

const express = require('express');
const cors = require('cors');
const { readdirSync } = require('fs');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const { db } = require('./db/db');

const app = express();

// Connect DB
db();

// Middlewares
app.use(express.json());
app.use(cors({
  origin: ["http://localhost:3000"]
}));

// API routes
const routesDir = path.join(__dirname, './routes');
readdirSync(routesDir).forEach((routeFile) => {
  app.use('/api/v1', require(path.join(routesDir, routeFile)));
});
app.use('/api/auth', authRoutes);

// Start local server
const PORT = process.env.PORT || 5000;
app.get('/', (req, res) => {
  res.send('API is running');
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
