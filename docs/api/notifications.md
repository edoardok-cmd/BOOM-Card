# Notifications API

## Overview

The Notifications API provides real-time and scheduled notification delivery to users across multiple channels including in-app, email, SMS, and push notifications. It supports user preferences, delivery tracking, and notification templates.

## Base URL

```
https://api.boomcard.bg/v1/notifications
```

## Authentication

All endpoints require authentication using Bearer tokens:

```
Authorization: Bearer <access_token>
```

## Notification Types

| Type | Description | Channels |
|------|-------------|----------|
| `transaction` | Discount usage notifications | in-app, email, push |
| `subscription` | Subscription updates and renewals | email, in-app |
| `partner_update` | New partners and offers | email, push, in-app |
| `system` | System messages and announcements | in-app, email |
| `marketing` | Promotional messages | email, sms |
| `reminder` | Subscription expiry reminders | email, push |

## Endpoints

### Send Notification

**POST** `/notifications/send`

Send a notification to one or more users.

#### Request Body

```json
{
  "type": "transaction",
  "recipients": ["user_id_1", "user_id_2"],
  "channels": ["email", "push"],
  "template_id": "transaction_success",
  "data": {
    "partner_name": "Restaurant Sofia",
    "discount_amount": 25,
    "saved_amount": 15.50,
    "transaction_id": "txn_123456"
  },
  "scheduled_at": "2024-01-15T14:30:00Z",
  "priority": "high"
}
```

#### Response

```json
{
  "notification_id": "notif_789xyz",
  "status": "queued",
  "recipients_count": 2,
  "channels": ["email", "push"],
  "scheduled_at": "2024-01-15T14:30:00Z"
}
```

### Bulk Send

**POST** `/notifications/bulk`

Send notifications to multiple users with different data.

#### Request Body

```json
{
  "notifications": [
    {
      "recipient": "user_id_1",
      "type": "subscription",
      "template_id": "subscription_renewal",
      "data": {
        "days_remaining": 3,
        "renewal_date": "2024-01-20"
      }
    },
    {
      "recipient": "user_id_2",
      "type": "partner_update",
      "template_id": "new_partner",
      "data": {
        "partner_name": "Spa Wellness Center",
        "discount_percentage": 30
      }
    }
  ],
  "default_channels": ["email", "in_app"]
}
```

### Get User Notifications

**GET** `/notifications/user/:userId`

Retrieve notifications for a specific user.

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status: `unread`, `read`, `archived` |
| `type` | string | Filter by notification type |
| `from` | string | Start date (ISO 8601) |
| `to` | string | End date (ISO 8601) |
| `limit` | number | Results per page (default: 20, max: 100) |
| `offset` | number | Pagination offset |

#### Response

```json
{
  "notifications": [
    {
      "id": "notif_123",
      "type": "transaction",
      "title": {
        "en": "Discount Applied Successfully",
        "bg": "Отстъпката е приложена успешно"
      },
      "message": {
        "en": "You saved €15.50 at Restaurant Sofia",
        "bg": "Спестихте 15.50 лв. в Ресторант София"
      },
      "status": "unread",
      "created_at": "2024-01-15T12:30:00Z",
      "read_at": null,
      "channels_delivered": ["push", "in_app"],
      "metadata": {
        "transaction_id": "txn_123456",
        "partner_id": "partner_789"
      }
    }
  ],
  "total": 45,
  "unread_count": 12
}
```

### Mark as Read

**PUT** `/notifications/:notificationId/read`

Mark a notification as read.

#### Response

```json
{
  "id": "notif_123",
  "status": "read",
  "read_at": "2024-01-15T13:45:00Z"
}
```

### Bulk Update Status

**PUT** `/notifications/bulk-status`

Update status for multiple notifications.

#### Request Body

```json
{
  "notification_ids": ["notif_123", "notif_456", "notif_789"],
  "status": "archived"
}
```

### Delete Notification

**DELETE** `/notifications/:notificationId`

Delete a notification.

#### Response

```json
{
  "success": true,
  "deleted_at": "2024-01-15T14:00:00Z"
}
```

## Notification Preferences

### Get User Preferences

**GET** `/notifications/preferences/:userId`

#### Response

```json
{
  "user_id": "user_123",
  "preferences": {
    "transaction": {
      "email": true,
      "push": true,
      "sms": false,
      "in_app": true
    },
    "marketing": {
      "email": true,
      "push": false,
      "sms": false,
      "in_app": false
    },
    "partner_update": {
      "email": true,
      "push": true,
      "sms": false,
      "in_app": true
    }
  },
  "quiet_hours": {
    "enabled": true,
    "start": "22:00",
    "end": "08:00",
    "timezone": "Europe/Sofia"
  },
  "language": "bg"
}
```

### Update User Preferences

**PUT** `/notifications/preferences/:userId`

#### Request Body

```json
{
  "preferences": {
    "marketing": {
      "email": false,
      "push": false
    }
  },
  "quiet_hours": {
    "enabled": true,
    "start": "23:00",
    "end": "07:00"
  }
}
```

## Templates

### List Templates

**GET** `/notifications/templates`

#### Response

```json
{
  "templates": [
    {
      "id": "transaction_success",
      "name": "Transaction Success",
      "type": "transaction",
      "channels": ["email", "push", "in_app"],
      "variables": ["partner_name", "discount_amount", "saved_amount"],
      "preview": {
        "en": {
          "subject": "Discount Applied at {{partner_name}}",
          "body": "You saved €{{saved_amount}} with your {{discount_amount}}% discount!"
        },
        "bg": {
          "subject": "Отстъпка приложена в {{partner_name}}",
          "body": "Спестихте {{saved_amount}} лв. с вашата {{discount_amount}}% отстъпка!"
        }
      }
    }
  ]
}
```

### Get Template

**GET** `/notifications/templates/:templateId`

### Create Custom Template

**POST** `/notifications/templates`

#### Request Body

```json
{
  "name": "Special Offer",
  "type": "marketing",
  "channels": ["email"],
  "content": {
    "en": {
      "subject": "{{partner_name}} Special Offer - {{discount}}% Off",
      "body": "<html>...</html>",
      "preview_text": "Exclusive discount for BOOM Card members"
    },
    "bg": {
      "subject": "{{partner_name}} Специална оферта - {{discount}}% намаление",
      "body": "<html>...</html>",
      "preview_text": "Ексклузивна отстъпка за членове на BOOM Card"
    }
  },
  "variables": ["partner_name", "discount", "valid_until"]
}
```

## Delivery Status

### Get Delivery Status

**GET** `/notifications/:notificationId/delivery`

#### Response

```json
{
  "notification_id": "notif_123",
  "delivery_status": {
    "email": {
      "status": "delivered",
      "delivered_at": "2024-01-15T12:31:00Z",
      "provider": "sendgrid",
      "message_id": "msg_abc123"
    },
    "push": {
      "status": "delivered",
      "delivered_at": "2024-01-15T12:30:15Z",
      "provider": "firebase",
      "tokens_success": 1,
      "tokens_failed": 0
    },
    "sms": {
      "status": "failed",
      "error": "Invalid phone number",
      "failed_at": "2024-01-15T12:30:30Z"
    }
  }
}
```

## Analytics

### Notification Statistics

**GET** `/notifications/analytics/stats`

#### Query Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | Start date (ISO 8601) |
| `to` | string | End date (ISO 8601) |
| `type` | string | Filter by notification type |
| `channel` | string | Filter by channel |

#### Response

```json
{
  "period": {
    "from": "2024-01-01T00:00:00Z",
    "to": "2024-01-15T23:59:59Z"
  },
  "statistics": {
    "total_sent": 15420,
    "delivered": 15200,
    "opened": 8500,
    "clicked": 3200,
    "failed": 220,
    "by_channel": {
      "email": {
        "sent": 8000,
        "delivered": 7900,
        "opened": 4500,
        "clicked": 2100
      },
      "push": {
        "sent": 5000,
        "delivered": 4950,
        "opened": 3000,
        "clicked": 800
      },
      "sms": {
        "sent": 2420,
        "delivered": 2350,
        "clicked": 300
      }
    },
    "by_type": {
      "transaction": {
        "sent": 8500,
        "engagement_rate": 0.78
      },
      "marketing": {
        "sent": 3920,
        "engagement_rate": 0.45
      }
    }
  }
}
```

## Webhooks

### Register Webhook

**POST** `/notifications/webhooks`

#### Request Body

```json
{
  "url": "https://partner.example.com/webhooks/notifications",
  "events": ["delivered", "failed", "opened", "clicked"],
  "secret": "webhook_secret_key",
  "active": true
}
```

### Webhook Events

#### Delivery Event

```json
{
  "event": "notification.delivered",
  "timestamp": "2024-01-15T12:31:00Z",
  "data": {
    "notification_id": "notif_123",
    "channel": "email",
    "recipient": "user_123",
    "delivered_at": "2024-01-15T12:31:00Z"
  }
}
```

#### Engagement Event

```json
{
  "event": "notification.opened",
  "timestamp": "2024-01-15T13:45:00Z",
  "data": {
    "notification_id": "notif_123",
    "channel": "email",
    "recipient": "user_123",
    "opened_at": "2024-01-15T13:45:00Z",
    "ip_address": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}
```

## Error Responses

### Rate Limit Error

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "retry_after": 60
  }
}
```

### Validation Error

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": [
      {
        "field": "template_id",
        "message": "Template not found"
      }
    ]
  }
}
```

## Rate Limits

| Endpoint | Rate Limit | Window |
|----------|------------|---------|
| Send notification | 100 requests | 1 minute |
| Bulk send | 10 requests | 1 minute |
| Get notifications | 300 requests | 1 minute |
| Update preferences | 30 requests | 1 minute |

## Best Practices

1. **Batch Operations**: Use bulk endpoints for sending multiple notifications
2. **Template Usage**: Use templates for consistent messaging acros