import { Express } from 'express';

export const setupRoutes = (app: Express): void => {
  app.get('/health', (_, res) => {
    res.json({ status: 'ok' });
  });

  // TODO: Add other routes here
};
