# POS Integration API Examples

This document provides comprehensive examples for integrating with the BOOM Card POS API system.

## Authentication

### Obtaining API Credentials

```typescript
// Request API credentials
POST /api/v1/pos/auth/register
Content-Type: application/json

{
  "businessId": "BUS123456",
  "posSystemType": "square",
  "posSystemVersion": "2.0",
  "callbackUrl": "https://partner.example.com/webhooks/boom-card"
}

// Response
{
  "apiKey": "pk_live_51234567890abcdef",
  "apiSecret": "sk_live_0987654321fedcba",
  "webhookSecret": "whsec_abcdef123456",
  "environment": "production"
}
```

### Authenticating Requests

```typescript
// Example: Authentication header
const headers = {
  'Authorization': `Bearer ${apiKey}`,
  'X-API-Secret': apiSecret,
  'X-POS-Terminal-ID': 'TERM001',
  'Content-Type': 'application/json'
};
```

## Transaction Processing

### Validate Discount Card

```typescript
// Validate card before applying discount
POST /api/v1/pos/cards/validate
Authorization: Bearer pk_live_51234567890abcdef

{
  "cardNumber": "BOOM1234567890",
  "terminalId": "TERM001",
  "transactionAmount": 150.00,
  "currency": "BGN",
  "items": [
    {
      "sku": "ITEM001",
      "name": "Grilled Salmon",
      "quantity": 1,
      "unitPrice": 45.00,
      "category": "main_course"
    },
    {
      "sku": "ITEM002",
      "name": "Caesar Salad",
      "quantity": 2,
      "unitPrice": 25.00,
      "category": "appetizer"
    }
  ]
}

// Success Response
{
  "valid": true,
  "cardHolder": {
    "firstName": "John",
    "lastName": "D***",
    "memberSince": "2024-01-15",
    "subscriptionStatus": "active"
  },
  "discount": {
    "percentage": 15,
    "amount": 22.50,
    "applicableItems": ["ITEM001", "ITEM002"],
    "restrictions": []
  },
  "finalAmount": 127.50,
  "validationToken": "val_tok_abc123def456"
}

// Invalid Card Response
{
  "valid": false,
  "error": {
    "code": "CARD_EXPIRED",
    "message": "This card has expired",
    "details": {
      "expiredDate": "2024-11-30"
    }
  }
}
```

### Process Transaction

```typescript
// Process payment with discount
POST /api/v1/pos/transactions/process
Authorization: Bearer pk_live_51234567890abcdef

{
  "validationToken": "val_tok_abc123def456",
  "cardNumber": "BOOM1234567890",
  "terminalId": "TERM001",
  "transaction": {
    "originalAmount": 150.00,
    "discountAmount": 22.50,
    "finalAmount": 127.50,
    "currency": "BGN",
    "paymentMethod": "card",
    "receiptNumber": "REC2024001234"
  },
  "items": [
    {
      "sku": "ITEM001",
      "name": "Grilled Salmon",
      "quantity": 1,
      "unitPrice": 45.00,
      "discountApplied": 6.75
    },
    {
      "sku": "ITEM002",
      "name": "Caesar Salad",
      "quantity": 2,
      "unitPrice": 25.00,
      "discountApplied": 7.50
    }
  ],
  "metadata": {
    "tableNumber": "12",
    "serverId": "EMP001",
    "orderType": "dine_in"
  }
}

// Success Response
{
  "transactionId": "txn_1234567890",
  "status": "completed",
  "timestamp": "2024-12-20T19:30:45Z",
  "receipt": {
    "url": "https://receipts.boomcard.com/txn_1234567890",
    "qrCode": "data:image/png;base64,..."
  },
  "rewards": {
    "pointsEarned": 127,
    "totalPoints": 1543,
    "nextReward": {
      "threshold": 2000,
      "reward": "Free Dessert"
    }
  }
}
```

### Void Transaction

```typescript
// Void a processed transaction
POST /api/v1/pos/transactions/{transactionId}/void
Authorization: Bearer pk_live_51234567890abcdef

{
  "reason": "customer_request",
  "terminalId": "TERM001",
  "authorizationCode": "AUTH123",
  "metadata": {
    "voidedBy": "EMP001",
    "notes": "Customer changed mind"
  }
}

// Response
{
  "voidId": "void_987654321",
  "originalTransactionId": "txn_1234567890",
  "status": "voided",
  "refundedAmount": 127.50,
  "pointsReversed": 127,
  "timestamp": "2024-12-20T19:45:30Z"
}
```

## Real-time Integration

### WebSocket Connection

```typescript
// Connect to real-time updates
const ws = new WebSocket('wss://api.boomcard.com/pos/realtime');

ws.on('open', () => {
  // Authenticate WebSocket connection
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'pk_live_51234567890abcdef',
    terminalId: 'TERM001'
  }));
});

ws.on('message', (data) => {
  const message = JSON.parse(data);
  
  switch(message.type) {
    case 'discount_update':
      // Handle real-time discount changes
      console.log('Discount updated:', message.data);
      break;
      
    case 'card_validation':
      // Handle card validation events
      console.log('Card validated:', message.data);
      break;
      
    case 'transaction_complete':
      // Handle completed transactions
      console.log('Transaction completed:', message.data);
      break;
  }
});
```

### Webhook Examples

```typescript
// Webhook endpoint implementation
app.post('/webhooks/boom-card', (req, res) => {
  const signature = req.headers['x-boom-signature'];
  const payload = JSON.stringify(req.body);
  
  // Verify webhook signature
  const expectedSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');
    
  if (signature !== expectedSignature) {
    return res.status(401).json({ error: 'Invalid signature' });
  }
  
  // Process webhook event
  const event = req.body;
  
  switch(event.type) {
    case 'transaction.completed':
      handleTransactionCompleted(event.data);
      break;
      
    case 'discount.updated':
      handleDiscountUpdated(event.data);
      break;
      
    case 'card.blocked':
      handleCardBlocked(event.data);
      break;
  }
  
  res.json({ received: true });
});
```

## Batch Operations

### Daily Settlement

```typescript
// Get daily settlement report
GET /api/v1/pos/settlements/daily?date=2024-12-20&terminalId=TERM001
Authorization: Bearer pk_live_51234567890abcdef

// Response
{
  "settlementId": "set_20241220_TERM001",
  "date": "2024-12-20",
  "terminal": {
    "id": "TERM001",
    "location": "Main Restaurant"
  },
  "summary": {
    "totalTransactions": 156,
    "totalOriginalAmount": 12450.00,
    "totalDiscountGiven": 1867.50,
    "totalFinalAmount": 10582.50,
    "averageDiscount": 15.0
  },
  "transactions": [
    {
      "transactionId": "txn_1234567890",
      "timestamp": "2024-12-20T12:30:00Z",
      "originalAmount": 150.00,
      "discount": 22.50,
      "finalAmount": 127.50
    }
    // ... more transactions
  ],
  "downloadUrl": "https://reports.boomcard.com/settlements/set_20241220_TERM001.pdf"
}
```

### Bulk Card Status Check

```typescript
// Check multiple card statuses
POST /api/v1/pos/cards/bulk-status
Authorization: Bearer pk_live_51234567890abcdef

{
  "cardNumbers": [
    "BOOM1234567890",
    "BOOM0987654321",
    "BOOM1122334455"
  ]
}

// Response
{
  "results": [
    {
      "cardNumber": "BOOM1234567890",
      "status": "active",
      "validUntil": "2025-12-31"
    },
    {
      "cardNumber": "BOOM0987654321",
      "status": "expired",
      "expiredOn": "2024-11-30"
    },
    {
      "cardNumber": "BOOM1122334455",
      "status": "blocked",
      "blockedReason": "fraud_suspicion"
    }
  ]
}
```

## Error Handling

### Common Error Responses

```typescript
// Network timeout
{
  "error": {
    "code": "NETWORK_TIMEOUT",
    "message": "Request timed out",
    "retryAfter": 5,
    "requestId": "req_abc123"
  }
}

// Rate limit exceeded
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "limit": 100,
    "reset": 1703187600,
    "retryAfter": 60
  }
}

// Invalid discount application
{
  "error": {
    "code": "INVALID_DISCOUNT",
    "message": "Discount cannot be applied",
    "details": {
      "reason": "minimum_amount_not_met",
      "minimumRequired": 50.00,
      "actualAmount": 35.00
    }
  }
}
```

### Retry Logic Example

```typescript
async function processTransactionWithRetry(data: any, maxRetries = 3) {
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      const response = await fetch('/api/v1/pos/transactions/process', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (response.ok) {
        return await response.json();
      }
      
      const error = await response.json();
      
      if (error.error.code === 'NETWORK_TIMEOUT' || 
          error.error.code === 'RATE_LIMIT_EXCEEDED') {
        retries++;
        await new Promise(resolve => 
          setTimeout(resolve, error.error.retryAfter * 1000)
        );
        continue;
      }
      
      throw new Error(error.error.message);
      
    } catch (error) {
      if (retries === maxRetries - 1) {
        throw error;
      }
      retries++;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
}
```

## SDK Integration Examples

### JavaScript/TypeScript SDK

```typescript
import { BoomCardPOS } from '@boomcard/pos-sdk';

// Initialize SDK
const pos = new BoomCardPOS({
  apiKey: 'pk_live_51234567890abcdef',
  apiSecret: 'sk_live_0987654321fedcba',
  environment: 'production',
  terminalId: 'TERM001'
});

// Validate and process transaction
async function processPayment(amount: number, items: any[]) {
  try {
    // Scan or input card
    const cardNumber = await pos.scanCard();
    
    // Validate card and get discount
    const validation = await pos.validateCard(cardNumber, {
      amount,
      items
    });
    
    if (!validation.valid) {
      throw new Error(validation.error.message);
    }
    
    // Process transaction
    const transaction = await pos.processTransaction({
      validationToken: validation.token,
      cardNumber,
      originalAmount: amount,
      discountAmount: validation.discount.amount,
      finalAmount: validation.finalAmount,
      items
    });
    
    // Print receipt
    await pos.printReceipt(transaction.receipt);
    
    return transaction;
    
  } catch (error) {
    console.error('Payment failed:', error);
    throw error;
  }
}
```

### React Integration

```typescript
import { useBoomCardPOS } from '@boomcard/pos-react';

function CheckoutComponent({ items, total }) {
  const { validateCard, processTransaction, loading, error } = useBoomCardPOS();
  const [cardNumber, setCardNumber] = useState('');
  const [discount, setDiscount] = useState(null);
  
  const handleValidate = async () => {
    const result = await validateCard(cardNumber, { amount: total, items });
    if (result.valid) {
      setDiscount(result.discount);
    }
  };
  
  const handleCheckout = async () => {
    const transaction = await processTransaction({
      cardNumber,
      originalAmount: total,
      discountAmount: discount.amount,
      items
    });
    
    if (transaction.success) {
      // Navigate to success page
    }
  };
  
  return (
    <div>
      <input 
        value={cardNumber}
        onChange={(e) => setCardNumber(e.target.value)}
        placeholder="Enter BOOM Card number"
      />
      <button onClick={handleValidate} disabled={loading}>
        Apply Discount
      </button>
      
      {discount && (
        <div>
          <p>Discount: {discount.percentage}% (-{discount.amount} BGN)</p>
          <p>Final amount: {total - discount.amount} BGN</p>
          <button onClick={handleCheckout}>Complete Payment</button>
        </div>
      )}
      
      {error && <p className="error">{error.message}</p>}
    </div>
  );
}
```
