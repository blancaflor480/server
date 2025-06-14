import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import inventoryRoutes from './routes/inventory';
import accountRoutes from './routes/account';


dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS options
const corsOptions = {
  origin: [
    'https://linen-snake-138010.hostingersite.com',
    // Add any other allowed domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/accounts', accountRoutes); // Add this line

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});