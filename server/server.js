import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware Configuration

// 1. CORS Configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
app.use(cors(corsOptions));

// 2. Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection Setup (Graceful - does not crash server if DB is not running)
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/dealvault');
    console.log(`📡 MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    console.log('💡 Continuing to run server without database connection for local development/testing.');
  }
};

// Initiate Database Connection
connectDB();

// API Routes

// 1. Health Check Route
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  
  res.status(200).json({
    status: 'OK',
    message: 'Escrow backend server is running smoothly',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbStatus,
    },
  });
});

// Root route placeholder
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to DealVault Escrow API' });
});

// Start Server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  console.log(`👉 Health check available at http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Shutting down gracefully.');
  server.close(() => {
    mongoose.connection.close(false).then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});
