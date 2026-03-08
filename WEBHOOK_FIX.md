# PhonePe Webhook Fix

## Issue
The webhook was being sent to the callback endpoint and failing because:
1. Webhook data structure uses `merchantOrderId` instead of `merchantTransactionId`
2. Webhook has a nested `payload` structure
3. The old merchant ID was in the webhook data

## Webhook Data Structure

PhonePe SDK sends webhooks in this format:
```json
{
  "type": "CHECKOUT_ORDER_COMPLETED",
  "event": "checkout.order.completed",
  "payload": {
    "merchantId": "M23D5FEM74BQ1",
    "merchantOrderId": "TXN_1772959881193_DE541C09",
    "orderId": "OMO2603081421215549124738W",
    "state": "COMPLETED",
    "currency": "INR",
    "amount": 100,
    "payableCurrency": "INR",
    "payableAmount": 100,
    "feeCurrency": "INR",
    "feeAmount": 0,
    "expireAt": 1772960781555,
    "paymentDetails": [...]
  }
}
```

## Fixes Applied

### 1. Enhanced Webhook Handler
The webhook handler now supports multiple data formats:

**Format 1: Direct webhook data**
```javascript
{
  merchantTransactionId: "...",
  transactionId: "...",
  state: "COMPLETED"
}
```

**Format 2: SDK webhook with payload** (Current format)
```javascript
{
  payload: {
    merchantOrderId: "...",  // Maps to merchantTransactionId
    orderId: "...",           // Maps to transactionId
    state: "COMPLETED"
  }
}
```

**Format 3: Nested data structure**
```javascript
{
  data: {
    merchantTransactionId: "...",
    state: "COMPLETED"
  }
}
```

### 2. Added Idempotency
- Checks if order is already completed before processing
- Prevents duplicate order completion
- Logs when order is already processed

### 3. Better Error Handling
- Comprehensive logging at each step
- Graceful handling of missing data
- Proper error responses

### 4. Support Both GET and POST
Both webhook and callback endpoints now accept GET and POST requests.

## Testing

### 1. Restart Server
```bash
pm2 restart index
pm2 logs index --lines 100
```

### 2. Monitor Webhook Logs
Look for these log messages:
```
Webhook received: {...}
Extracted webhook data: {...}
Transaction found: {...}
Order found: {...}
Webhook: Payment completed, processing order...
Order completed successfully via webhook
```

### 3. Test Webhook Endpoint
```bash
# Test webhook is accessible
curl -X POST https://api.pearline.in/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

## Flow Comparison

### Callback Flow (User Redirect)
1. User completes payment on PhonePe
2. PhonePe redirects → `https://api.pearline.in/payment/callback?orderId=XXX`
3. Backend checks payment status with PhonePe API
4. Redirects user to success/failure page

### Webhook Flow (Server-to-Server)
1. PhonePe sends webhook → `https://api.pearline.in/payment/webhook`
2. Backend receives payment status directly
3. Processes order completion
4. Responds to PhonePe with success/failure

## Important Notes

### Webhook vs Callback
- **Webhook**: Server-to-server, reliable, happens in background
- **Callback**: User redirect, can fail if user closes browser
- **Best Practice**: Use webhook as primary, callback as backup

### Idempotency
Both webhook and callback now check if order is already completed:
```javascript
if (order.status === "Paid" && order.paymentStatus === "Completed") {
  console.log("Order already completed, skipping");
  return; // Don't process again
}
```

### Merchant ID Mismatch
The webhook shows `merchantId: 'M23D5FEM74BQ1'` (old ID) but you're using `SU2602261559251369533340` (new ID).

**Action Required:**
- Verify which merchant ID is correct in your PhonePe dashboard
- Update `.env` if needed
- The webhook handler now works regardless of merchant ID in webhook data

## PhonePe Dashboard Configuration

Ensure these are configured in your PhonePe merchant portal:

1. **Webhook URL**: `https://api.pearline.in/payment/webhook`
2. **Redirect URL**: `https://api.pearline.in/payment/callback`
3. **Webhook Events**: Enable "Order Completed" event
4. **IP Whitelisting**: Add your server IP if required

## Troubleshooting

### Webhook Not Received
1. Check PhonePe dashboard webhook configuration
2. Verify webhook URL is accessible from internet
3. Check firewall/security group settings
4. Test with PhonePe's webhook testing tool

### Order Not Completing
1. Check logs for "Transaction found" message
2. Verify merchantTransactionId matches between order and webhook
3. Check if order is already completed (idempotency)
4. Verify cart items and stock availability

### Duplicate Processing
- Now prevented by idempotency check
- Both webhook and callback check order status first
- Safe to receive both webhook and callback

## Next Steps

1. ✅ Restart server
2. ✅ Test payment flow end-to-end
3. ✅ Monitor logs for webhook reception
4. ✅ Verify order completion
5. ✅ Check stock reduction
6. ✅ Verify cart clearing
7. ⚠️ Confirm merchant ID in PhonePe dashboard
