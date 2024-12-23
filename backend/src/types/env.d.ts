declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      NODE_ENV: 'development' | 'production' | 'test';
      SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
      STRIPE_SECRET_KEY: string;
      STRIPE_WEBHOOK_SECRET: string;
      SENTRY_DSN?: string;
    }
  }
}

export {};
