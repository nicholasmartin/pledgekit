import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import * as Sentry from '@sentry/node';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { setupRoutes } from './routes';

// Load environment variables
dotenv.config();

const app = express();

// Initialize Sentry
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
  });
  app.use(Sentry.Handlers.requestHandler());
}

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

// Routes
setupRoutes(app);

// Error handling
if (process.env.SENTRY_DSN) {
  app.use(Sentry.Handlers.errorHandler());
}
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
