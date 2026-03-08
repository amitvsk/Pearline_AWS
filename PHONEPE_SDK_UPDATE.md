# PhonePe SDK Integration Update

## Updated Credentials

The PhonePe integration has been updated with new credentials:

- **Merchant ID**: `SU2602261559251369533340`
- **Salt Key**: `5615933d-0907-4c39-8e49-0a363aae476a`
- **Environment**: Production
- **Mock Mode**: Disabled

## Changes Made

### 1. Installed Official SDK
```bash
npm install pg-sdk-node
```

### 2. Updated Configuration (`config/phonepe.js`)
- Switched from custom SDK wrapper to official `pg-sdk-node` package
- Using `StandardCheckoutClient` for payment operations
- Configured for PRODUCTION environment

### 3. Updated Payment Controller
- Replaced custom SDK methods with official SDK methods:
  - `phonePeClient.pay()` - Create payment
  - `phonePeClient.getOrderStatus()` - Check payment status
- Updated payment flow to use `CreateSdkOrderRequest.StandardCheckoutBuilder()`
- Simplified webhook handling

## Key Methods

### Create Payment
```javascript
const paymentRequest = CreateSdkOrderRequest.StandardCheckoutBuilder()
  .merchantOrderId(merchantTransactionId)
  .amount(total * 100) // Amount in paise
  .redirectUrl(redirectUrl)
  .build();

const response = await phonePeClient.pay(paymentRequest);
```

### Check Payment Status
```javascript
const statusResponse = await phonePeClient.getOrderStatus(merchantTransactionId);
```

### Payment States
- `COMPLETED` - Payment successful
- `PENDING` - Payment in progress
- `FAILED` - Payment failed

## Testing

1. Restart your Node.js server:
```bash
pm2 restart index
```

2. Monitor logs:
```bash
pm2 logs index
```

3. Test with a small transaction first

## Environment Variables

Ensure these are set in your `.env` file:
```env
PHONEPE_MERCHANT_ID=SU2602261559251369533340
PHONEPE_SALT_KEY=5615933d-0907-4c39-8e49-0a363aae476a
PHONEPE_SALT_INDEX=1
PHONEPE_API_URL=https://api.phonepe.com/apis/hermes
PHONEPE_REDIRECT_URL=https://api.pearline.in/payment/callback
PHONEPE_WEBHOOK_URL=https://api.pearline.in/payment/webhook
PHONEPE_MOCK_MODE=false
FRONTEND_URL=https://pearline.in
```

## Troubleshooting

If you encounter errors:
1. Check the logs for detailed error messages
2. Verify merchant credentials in PhonePe dashboard
3. Ensure webhook URL is whitelisted in PhonePe merchant portal
4. Confirm redirect URL is properly configured

## Next Steps

1. Test payment flow end-to-end
2. Verify webhook is receiving callbacks
3. Monitor transaction status updates
4. Test refund functionality if needed
