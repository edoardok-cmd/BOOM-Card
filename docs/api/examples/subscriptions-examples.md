# Subscriptions API Examples

## Overview

This document provides comprehensive examples for interacting with the BOOM Card subscriptions API. All examples include proper error handling, TypeScript types, and best practices for production use.

## Authentication

All subscription endpoints require authentication. Include the Bearer token in the Authorization header:

```typescript
const headers = {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json',
  'Accept-Language': 'en' // or 'bg' for Bulgarian
};
```

## Base URL

```
Production: https://api.boomcard.bg/v1
Staging: https://staging-api.boomcard.bg/v1
```

## Types and Interfaces

```typescript
// Subscription Plans
interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'quarterly' | 'yearly';
  features: string[];
  maxCards: number;
  discountPercentage: number;
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Subscription
interface Subscription {
  id: string;
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'past_due' | 'paused' | 'trialing';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  trialEnd?: string;
  canceledAt?: string;
  createdAt: string;
  updatedAt: string;
  plan: SubscriptionPlan;
  paymentMethod?: PaymentMethod;
}

// Payment Method
interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'paypal';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

// Subscription Update
interface SubscriptionUpdate {
  planId?: string;
  paymentMethodId?: string;
  cancelAtPeriodEnd?: boolean;
}

// Usage Statistics
interface SubscriptionUsage {
  subscriptionId: string;
  period: {
    start: string;
    end: string;
  };
  discountsUsed: number;
  totalSavings: number;
  transactionCount: number;
  partnerBreakdown: Array<{
    partnerId: string;
    partnerName: string;
    transactionCount: number;
    totalSavings: number;
  }>;
}

// Invoice
interface Invoice {
  id: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible';
  dueDate: string;
  paidAt?: string;
  invoiceNumber: string;
  pdf: string;
  items: InvoiceItem[];
}

interface InvoiceItem {
  description: string;
  amount: number;
  quantity: number;
  taxRate: number;
}
```

## 1. List Available Subscription Plans

### Request

```typescript
GET /subscriptions/plans
```

### Example Implementation

```typescript
import axios, { AxiosError } from 'axios';

interface ListPlansParams {
  active?: boolean;
  locale?: 'en' | 'bg';
}

interface ListPlansResponse {
  plans: SubscriptionPlan[];
  total: number;
}

async function listSubscriptionPlans(
  params?: ListPlansParams
): Promise<ListPlansResponse> {
  try {
    const response = await axios.get<ListPlansResponse>(
      `${BASE_URL}/subscriptions/plans`,
      {
        params: {
          active: params?.active ?? true,
          locale: params?.locale ?? 'en'
        },
        headers
      }
    );

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error('Failed to fetch subscription plans:', axiosError.response?.data);
      throw new Error(
        axiosError.response?.data?.message || 'Failed to fetch subscription plans'
      );
    }
    throw error;
  }
}

// Usage example
const plans = await listSubscriptionPlans({ active: true, locale: 'bg' });
```

### Response Example

```json
{
  "plans": [
    {
      "id": "plan_basic_monthly",
      "name": "Basic Monthly",
      "description": "Perfect for occasional diners",
      "price": 9.99,
      "currency": "BGN",
      "interval": "monthly",
      "features": [
        "10% discount at all partners",
        "Access to exclusive deals",
        "Monthly newsletter"
      ],
      "maxCards": 1,
      "discountPercentage": 10,
      "isActive": true
    },
    {
      "id": "plan_premium_yearly",
      "name": "Premium Yearly",
      "description": "Best value for frequent users",
      "price": 199.99,
      "currency": "BGN",
      "interval": "yearly",
      "features": [
        "20% discount at all partners",
        "Early access to new partners",
        "Priority customer support",
        "Family sharing (up to 4 cards)"
      ],
      "maxCards": 4,
      "discountPercentage": 20,
      "isActive": true
    }
  ],
  "total": 2
}
```

## 2. Create Subscription

### Request

```typescript
POST /subscriptions
```

### Example Implementation

```typescript
interface CreateSubscriptionParams {
  planId: string;
  paymentMethodId?: string;
  trialDays?: number;
  metadata?: Record<string, any>;
}

interface CreateSubscriptionResponse {
  subscription: Subscription;
  paymentIntent?: {
    clientSecret: string;
    requiresAction: boolean;
  };
}

async function createSubscription(
  params: CreateSubscriptionParams
): Promise<CreateSubscriptionResponse> {
  try {
    const response = await axios.post<CreateSubscriptionResponse>(
      `${BASE_URL}/subscriptions`,
      {
        planId: params.planId,
        paymentMethodId: params.paymentMethodId,
        trialDays: params.trialDays,
        metadata: params.metadata
      },
      { headers }
    );

    // Handle 3D Secure authentication if required
    if (response.data.paymentIntent?.requiresAction) {
      console.log('3D Secure authentication required');
      // Implement 3D Secure flow
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      // Handle specific error cases
      if (axiosError.response?.status === 402) {
        throw new Error('Payment method required or payment failed');
      }
      
      if (axiosError.response?.status === 409) {
        throw new Error('Active subscription already exists');
      }
      
      throw new Error(
        axiosError.response?.data?.message || 'Failed to create subscription'
      );
    }
    throw error;
  }
}

// Usage example with error handling
try {
  const result = await createSubscription({
    planId: 'plan_premium_yearly',
    paymentMethodId: 'pm_123456',
    trialDays: 7,
    metadata: {
      referralCode: 'FRIEND2024',
      source: 'mobile_app'
    }
  });
  
  if (result.paymentIntent?.requiresAction) {
    // Handle 3D Secure
    await handle3DSecure(result.paymentIntent.clientSecret);
  }
} catch (error) {
  console.error('Subscription creation failed:', error);
}
```

## 3. Get Current Subscription

### Request

```typescript
GET /subscriptions/current
```

### Example Implementation

```typescript
async function getCurrentSubscription(): Promise<Subscription | null> {
  try {
    const response = await axios.get<{ subscription: Subscription }>(
      `${BASE_URL}/subscriptions/current`,
      { headers }
    );

    return response.data.subscription;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 404) {
        return null; // No active subscription
      }
      
      throw new Error(
        axiosError.response?.data?.message || 'Failed to fetch subscription'
      );
    }
    throw error;
  }
}

// Usage with null check
const subscription = await getCurrentSubscription();
if (!subscription) {
  console.log('No active subscription found');
  // Redirect to plans page
}
```

## 4. Update Subscription

### Request

```typescript
PATCH /subscriptions/{subscriptionId}
```

### Example Implementation

```typescript
async function updateSubscription(
  subscriptionId: string,
  updates: SubscriptionUpdate
): Promise<Subscription> {
  try {
    const response = await axios.patch<{ subscription: Subscription }>(
      `${BASE_URL}/subscriptions/${subscriptionId}`,
      updates,
      { headers }
    );

    return response.data.subscription;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 400) {
        throw new Error('Invalid update parameters');
      }
      
      if (axiosError.response?.status === 403) {
        throw new Error('Cannot update subscription in current state');
      }
      
      throw new Error(
        axiosError.response?.data?.message || 'Failed to update subscription'
      );
    }
    throw error;
  }
}

// Example: Upgrade subscription
async function upgradeSubscription(currentSubscriptionId: string, newPlanId: string) {
  try {
    // First, check if upgrade is allowed
    const proration = await previewSubscriptionUpdate(currentSubscriptionId, newPlanId);
    
    if (proration.amount > 0) {
      console.log(`Upgrade will cost: ${proration.amount} ${proration.currency}`);
    }
    
    // Perform the upgrade
    const updated = await updateSubscription(currentSubscriptionId, {
      planId: newPlanId
    });
    
    return updated;
  } catch (error) {
    console.error('Upgrade failed:', error);
    throw error;
  }
}
```

## 5. Cancel Subscription

### Request

```typescript
POST /subscriptions/{subscriptionId}/cancel
```

### Example Implementation

```typescript
interface CancelSubscriptionParams {
  immediately?: boolean;
  reason?: string;
  feedback?: string;
}

async function cancelSubscription(
  subscriptionId: string,
  params?: CancelSubscriptionParams
): Promise<Subscription> {
  try {
    const response = await axios.post<{ subscription: Subscription }>(
      `${BASE_URL}/subscriptions/${subscriptionId}/cancel`,
      {
        immediately: params?.immediately ?? false,
        reason: params?.reason,
        feedback: params?.feedback
      },
      { headers }
    );

    return response.data.subscription;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 404) {
        throw new Error('Subscription not found');
      }
      
      if (axiosError.response?.status === 409) {
        throw new Error('Subscription already canceled');
      }
      
      throw new Error(
        axiosError.response?.data?.message || 'Failed to cancel subscription'
      );
    }
    throw error;
  }
}

// Usage with confirmation
async function handleCancelSubscription(subscriptionId: string) {
  const confirmed = await showConfirmationDialog({
    title: 'Cancel Subscription?',
    message: 'You will lose access to discounts at the end of your billing period.',
    confirmText: 'Yes, cancel',
    cancelText: 'Keep subscription'
  });
  
  if (!confirmed) return;
  
  try {
    const canceled = await cancelSubscription(subscriptionId, {
      reason: 'too_expensive',
      feedback: 'Would reconsider at lower price point'
    });
    
    console.log('Subscription will end on:', canceled.currentPeriodEnd);
  } catch (error) {
    console.error('Cancellation failed:', error);
  }
}
```

## 6. Reactivate Subscription

### Request

```typescript
POST /subscriptions/{subscriptionId}/reactivate
```

### Example Implementation

```typescript
async function reactivateSubscription(subscriptionId: string): Promise<Subscription> {
  try {
    const response = await axios.post<{ subscription: Subscription }>(
      `${BASE_URL}/subscriptions/${subscriptionId}/reactivate`,
      {},
      { headers }
    );

    return response.data.subscription;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response?.status === 400) {
        throw new Error('Subscription cannot be reactivated');
      }
      
      if (axiosError.response?.status === 402) {
        throw new Error('Payment method required or payment failed');
      }
      
      throw new Error(
        axiosError.resp