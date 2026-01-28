import express from 'express';
import path from 'path';
import { ENV } from './config/env.js';
import { clerkMiddleware } from '@clerk/express';
import { connectDB } from './config/db.js';

const app = express();
const __dirname = path.resolve();
app.use(clerkMiddleware()); // adds auth object under the req => req.auth
app.get('/api/health', (req, res) => {
  const response = { message: 'Hello World!' };
  if (ENV.NODE_ENV !== 'production') {
    response.auth = req.auth;
  }
  res.status(200).json(response);
});

//make our app ready for deployment
if (ENV.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../admin/dist')));
  app.get('/{*any}', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin', 'dist', 'index.html'));
  });
}

const startServer = async () => {
  await connectDB();
  app.listen(ENV.PORT, () => {
    console.log(`Server running on port ${ENV.PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
