import { Stripe as StripeType } from 'stripe';

export interface CreateCheckoutSessionData {
  pledgeOptionId: string;
  projectId: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}

export interface StripeCheckoutMetadata {
  projectId: string;
  pledgeOptionId: string;
  userId: string;
}

// Types for Stripe webhook events we care about
export interface StripeWebhookEvents {
  'checkout.session.completed': StripeType.Checkout.Session;
  'payment_intent.succeeded': StripeType.PaymentIntent;
  'payment_intent.payment_failed': StripeType.PaymentIntent;
}
