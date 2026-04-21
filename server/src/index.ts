import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { initDb } from './db';
import apiRoutes from './routes';


dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static assets from the server's public directory
app.use('/assets', express.static(path.join(__dirname, '../public/assets')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Initialize DB
initDb();

// API Routes
app.use('/api', apiRoutes);

app.get('/', (req: Request, res: Response) => {
  res.send('iPOS API Backend is running...');
});

app.listen(Number(port), '0.0.0.0', () => {
  console.log(`[server]: Server is running at http://0.0.0.0:${port}`);
});

// Capture termination signals
process.on('SIGTERM', () => {
  console.log('[server]: SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('[server]: SIGINT received. Shutting down gracefully...');
  process.exit(0);
});
