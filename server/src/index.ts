import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { clerkMiddleware } from '@clerk/express';

// Load environment variables
dotenv.config();

// Check required env variables
if (!process.env.CLERK_PUBLISHABLE_KEY) {
  throw new Error('Missing CLERK_PUBLISHABLE_KEY in .env file');
}

const app = express();

// Middleware setup
app.use(cors());
app.use(express.json());

// Initialize Clerk middleware
app.use(clerkMiddleware());

// Debug: Confirm Clerk is configured
console.log('Clerk middleware initialized with key:', process.env.CLERK_PUBLISHABLE_KEY);

// Routes
app.get('/', (req, res) => {
  res.send('Server running 🚀');
});

// Example protected route
/*
import { requireAuth } from '@clerk/express';

app.get('/protected', requireAuth(), (req, res) => {
  const { userId } = req.auth;
  res.json({ message: `Hello user ${userId}` });
});
*/

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
