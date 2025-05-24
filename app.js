import path from 'path'
import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan'
import db from './db/db.js';
import colors from 'colors'
import cors from 'cors';
import { notFound, errorHandler } from './middleware/errorMiddlware.js'
import productRoutes from './routes/productRoutes.js'
import userRoutes from './routes/userRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import supplierRoutes from './routes/supplierRoutes.js'


const app = express();

// Connect to DB
db();

// Middlewares
app.use(express.json());
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cors({
  origin: [
    "https://chetanagrohub.netlify.app",
    "http://localhost:3000"
  ],
  credentials: true
}));

app.use('/api', productRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/supplier', supplierRoutes);

// PAYPAL 
app.get('/api/config/paypal', (req, res) => res.send(process.env.PAYPAL_CLIENT_ID))

const __dirname = path.resolve()
app.use('/uploads', express.static(path.join(__dirname, '/uploads')))
app.use('/img', express.static(path.join(process.cwd(), 'public', 'img')));

app.use(notFound)
app.use(errorHandler)

app.get('/', (req, res) => {
  res.send({
    activeStatus: true,
    error: false,
  });
});

// Export the handler for Vercel
export default app;