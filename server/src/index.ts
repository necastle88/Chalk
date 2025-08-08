import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';
import workoutRoutes from './routes/workouts';

// Load environment variables
dotenv.config();

const app = express();

// Basic middleware setup
app.use(cors({
  origin: [
    process.env.CLIENT_URL || 'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(clerkMiddleware());

// Routes
app.get('/', (req, res) => {
  res.send('Server running 🚀');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/workouts', workoutRoutes);

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
