# Subscriptions API

## Overview

The Subscriptions API manages all subscription-related operations for the BOOM Card platform, including plan management, subscription lifecycle, billing, and renewal handling.

## Authentication

All endpoints require authentication using Bearer tokens:

```
Authorization: Bearer <access_token>
```

## Base URL

```
https://api.boomcard.bg/v1
```

## Subscription Plans

### Get Available Plans

```http
GET /subscriptions/plans
```

Query Parameters:
- `locale` (string): Language code (en, bg)
- `active` (boolean): Filter active plans only

Response:
```json
{
  "plans": [
    {
      "id": "plan_monthly_basic",
      "name": "Basic Monthly",
      "description": "Access to all partner discounts",
      "price": {
        "amount": 9.99,
        "currency": "BGN",
        "interval": "month"
      },
      "features": [
        "Unlimited discount usage",
        "Access to all partners",
        "Mobile app access",
        "Basic support"
      ],
      "trial_days": 7,
      "is_active": true,
      "metadata": {
        "popular": false,
        "savings_potential": "up to 300 BGN/month"
      }
    },
    {
      "id": "plan_annual_premium",
      "name": "Premium Annual",
      "description": "Best value with exclusive benefits",
      "price": {
        "amount": 89.99,
        "currency": "BGN",
        "interval": "year"
      },
      "features": [
        "Everything in Basic",
        "Early access to new partners",
        "Premium support",
        "Exclusive VIP events",
        "Guest passes (2/month)"
      ],
      "trial_days": 14,
      "is_active": true,
      "metadata": {
        "popular": true,
        "savings_potential": "up to 4000 BGN/year",
        "discount_percentage": 25
      }
    }
  ]
}
```

### Get Plan Details

```http
GET /subscriptions/plans/{plan_id}
```

Response:
```json
{
  "id": "plan_monthly_basic",
  "name": "Basic Monthly",
  "description": "Access to all partner discounts",
  "price": {
    "amount": 9.99,
    "currency": "BGN",
    "interval": "month"
  },
  "features": [
    "Unlimited discount usage",
    "Access to all partners",
    "Mobile app access",
    "Basic support"
  ],
  "trial_days": 7,
  "is_active": true,
  "terms": {
    "auto_renewal": true,
    "cancellation_policy": "anytime",
    "refund_policy": "prorated"
  }
}
```

## User Subscriptions

### Get Current Subscription

```http
GET /subscriptions/current
```

Headers:
- `Authorization: Bearer <user_token>`

Response:
```json
{
  "subscription": {
    "id": "sub_abc123",
    "user_id": "usr_def456",
    "plan_id": "plan_monthly_basic",
    "status": "active",
    "current_period_start": "2024-01-01T00:00:00Z",
    "current_period_end": "2024-02-01T00:00:00Z",
    "created_at": "2023-12-25T10:00:00Z",
    "trial_end": null,
    "cancel_at_period_end": false,
    "canceled_at": null,
    "payment_method": {
      "type": "card",
      "last4": "4242",
      "brand": "visa"
    },
    "next_billing": {
      "date": "2024-02-01T00:00:00Z",
      "amount": 9.99,
      "currency": "BGN"
    },
    "usage_stats": {
      "total_savings": 145.50,
      "discounts_used": 23,
      "favorite_partners": ["partner_123", "partner_456"]
    }
  }
}
```

### Create Subscription

```http
POST /subscriptions
```

Request Body:
```json
{
  "plan_id": "plan_monthly_basic",
  "payment_method_id": "pm_abc123",
  "promo_code": "WELCOME20",
  "metadata": {
    "source": "mobile_app",
    "campaign": "new_year_2024"
  }
}
```

Response:
```json
{
  "subscription": {
    "id": "sub_new123",
    "user_id": "usr_def456",
    "plan_id": "plan_monthly_basic",
    "status": "trialing",
    "trial_end": "2024-01-08T00:00:00Z",
    "created_at": "2024-01-01T10:00:00Z",
    "payment_intent": {
      "client_secret": "pi_secret_xyz",
      "status": "requires_payment_method"
    }
  }
}
```

### Update Subscription

```http
PUT /subscriptions/{subscription_id}
```

Request Body:
```json
{
  "plan_id": "plan_annual_premium",
  "proration_behavior": "create_prorations"
}
```

Response:
```json
{
  "subscription": {
    "id": "sub_abc123",
    "plan_id": "plan_annual_premium",
    "status": "active",
    "updated_at": "2024-01-15T14:30:00Z",
    "proration": {
      "amount": -5.50,
      "description": "Unused time on Basic Monthly"
    }
  }
}
```

### Cancel Subscription

```http
DELETE /subscriptions/{subscription_id}
```

Query Parameters:
- `immediately` (boolean): Cancel immediately vs end of period
- `reason` (string): Cancellation reason
- `feedback` (string): Optional user feedback

Response:
```json
{
  "subscription": {
    "id": "sub_abc123",
    "status": "active",
    "cancel_at_period_end": true,
    "canceled_at": "2024-01-15T14:30:00Z",
    "cancellation_details": {
      "reason": "too_expensive",
      "feedback": "Would reconsider at lower price",
      "effective_date": "2024-02-01T00:00:00Z"
    }
  }
}
```

### Reactivate Subscription

```http
POST /subscriptions/{subscription_id}/reactivate
```

Response:
```json
{
  "subscription": {
    "id": "sub_abc123",
    "status": "active",
    "cancel_at_period_end": false,
    "reactivated_at": "2024-01-16T10:00:00Z"
  }
}
```

## Subscription History

### Get Subscription History

```http
GET /subscriptions/history
```

Query Parameters:
- `limit` (integer): Number of records (default: 20)
- `offset` (integer): Pagination offset
- `status` (string): Filter by status

Response:
```json
{
  "subscriptions": [
    {
      "id": "sub_old123",
      "plan_id": "plan_monthly_basic",
      "status": "canceled",
      "start_date": "2023-01-01T00:00:00Z",
      "end_date": "2023-06-01T00:00:00Z",
      "total_paid": 49.95,
      "total_savings": 567.80
    }
  ],
  "pagination": {
    "total": 3,
    "limit": 20,
    "offset": 0
  }
}
```

## Billing & Invoices

### Get Invoices

```http
GET /subscriptions/invoices
```

Query Parameters:
- `subscription_id` (string): Filter by subscription
- `status` (string): paid, pending, failed
- `from_date` (string): ISO date
- `to_date` (string): ISO date

Response:
```json
{
  "invoices": [
    {
      "id": "inv_abc123",
      "number": "BOOM-2024-0001",
      "subscription_id": "sub_abc123",
      "amount": 9.99,
      "currency": "BGN",
      "status": "paid",
      "created_at": "2024-01-01T00:00:00Z",
      "paid_at": "2024-01-01T00:05:00Z",
      "pdf_url": "https://invoices.boomcard.bg/inv_abc123.pdf",
      "line_items": [
        {
          "description": "Basic Monthly Subscription",
          "amount": 9.99,
          "period": {
            "start": "2024-01-01",
            "end": "2024-02-01"
          }
        }
      ]
    }
  ]
}
```

### Download Invoice

```http
GET /subscriptions/invoices/{invoice_id}/download
```

Response: PDF file stream

## Payment Methods

### Get Payment Methods

```http
GET /subscriptions/payment-methods
```

Response:
```json
{
  "payment_methods": [
    {
      "id": "pm_abc123",
      "type": "card",
      "card": {
        "brand": "visa",
        "last4": "4242",
        "exp_month": 12,
        "exp_year": 2025
      },
      "is_default": true,
      "created_at": "2023-12-25T10:00:00Z"
    }
  ]
}
```

### Add Payment Method

```http
POST /subscriptions/payment-methods
```

Request Body:
```json
{
  "type": "card",
  "card": {
    "number": "4242424242424242",
    "exp_month": 12,
    "exp_year": 2025,
    "cvc": "123"
  },
  "billing_details": {
    "name": "John Doe",
    "email": "john@example.com",
    "address": {
      "line1": "123 Main St",
      "city": "Sofia",
      "postal_code": "1000",
      "country": "BG"
    }
  },
  "set_as_default": true
}
```

### Update Default Payment Method

```http
PUT /subscriptions/payment-methods/{pm_id}/default
```

## Promo Codes

### Validate Promo Code

```http
POST /subscriptions/promo-codes/validate
```

Request Body:
```json
{
  "code": "WELCOME20",
  "plan_id": "plan_monthly_basic"
}
```

Response:
```json
{
  "valid": true,
  "promo_code": {
    "code": "WELCOME20",
    "description": "20% off first 3 months",
    "discount": {
      "type": "percentage",
      "amount": 20,
      "duration": "repeating",
      "duration_in_months": 3
    },
    "restrictions": {
      "first_time_only": true,
      "valid_until": "2024-12-31T23:59:59Z",
      "applicable_plans": ["plan_monthly_basic", "plan_annual_premium"]
    }
  },
  "preview": {
    "original_price": 9.99,
    "discounted_price": 7.99,
    "savings": 2.00,
    "applicable_months": 3
  }
}
```

## Webhooks

### Subscription Webhooks

Webhook events are sent to your configured endpoint for subscription lifecycle events:

#### subscription.created
```json
{
  "event": "subscription.created",
  "timestamp": "2024-01-01T10:00:00Z",
  "data": {
    "subscription_id": "sub_abc123",
    "user_id": "usr_def456",
    "plan_id": "plan_monthly_basic",
    "status": "trialing"
  }
}
```

#### subscription.updated
```json
{
  "event": "subscription.updated",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "subscription_id": "sub_abc123",
    "changes": {
      "plan_id": {
        "from": "plan_monthly_basic",
        "to": "plan_annual_premium"
      }
    }
  }
}
```

#### subscription.canceled
```json
{
  "event": "subscription.canceled",
  "timestamp": "2024-01-15T14:30:00Z",
  "data": {
    "subscription_id": "sub_abc123",
    "reason": "user_initiated",
    "effective_date": "2024-02-01T00:00:00Z"
  }
}
```

#### payment.failed
```json
{
  "event": "payment.failed",
  "timestamp": "2024-02-01T00:05:00Z",
  "data": {
    "subscription_id": "sub_abc123",
    "invoice_id": "inv_def456",
    "error": {
      "code": "card_declined",
      "message": "Your card was declined"
    },
    "retry_attempt": 1,
    "next_retry": "2024-02-03T00:00:00Z"
  }
}
```

## Error Responses

### Error Format

```json
{
  "error": {
    "code": "subscription_not_found",
    "message": "The requested subscription does not exist",
    "details": {
      "subscription_id": "sub_invalid123"
    }
  }
}
```

### Common Error Codes

- `invalid_plan_id` - The specified plan does not exist
- `subscription_not_found` - Subscription ID not found
- `payment_method_required` - No payment method on file
- `invalid_promo_code` - Promo code is invalid or expired
- `subscription_already_canceled` - Subscription is already canceled
- `insufficient_permissions` - User lacks permission for this action
- `payment_failed` - Payment processing failed
- `trial_already_used` - User has already used their trial

## Rate Limits

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated requests
- 429 Too Many Requests response when exceeded

## Versioning

API version is specified in the URL path. Current version: v1

Breaking changes will result in a new API version. Non-breaking changes and additions will be made to the current version.
