import PhonePeSDK from '../utils/phonePeSDK.js';

// Initialize PhonePe SDK
const phonePeSDK = new PhonePeSDK({
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX,
  apiUrl: process.env.PHONEPE_API_URL,
  redirectUrl: process.env.PHONEPE_REDIRECT_URL,
  callbackUrl: process.env.PHONEPE_WEBHOOK_URL,
  env: process.env.NODE_ENV === 'production' ? 'production' : 'uat'
});

export default phonePeSDK;

// Export config for backward compatibility
export const phonePeConfig = {
  merchantId: process.env.PHONEPE_MERCHANT_ID,
  saltKey: process.env.PHONEPE_SALT_KEY,
  saltIndex: process.env.PHONEPE_SALT_INDEX,
  apiUrl: process.env.PHONEPE_API_URL,
  redirectUrl: process.env.PHONEPE_REDIRECT_URL,
  webhookUrl: process.env.PHONEPE_WEBHOOK_URL
};
