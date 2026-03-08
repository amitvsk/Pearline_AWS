import { StandardCheckoutClient, Env } from 'pg-sdk-node';

// Initialize PhonePe SDK using official pg-sdk-node
const clientId = process.env.PHONEPE_MERCHANT_ID || "SU2602261559251369533340";
const clientSecret = process.env.PHONEPE_SALT_KEY || "5615933d-0907-4c39-8e49-0a363aae476a";
const clientVersion = 1;

// Determine environment
const env = process.env.NODE_ENV === 'production' ? Env.PRODUCTION : Env.PRODUCTION;

// Create SDK client instance
const phonePeClient = StandardCheckoutClient.getInstance(
  clientId,
  clientSecret,
  clientVersion,
  env
);

console.log('PhonePe SDK Initialized:', {
  merchantId: clientId,
  environment: env === Env.PRODUCTION ? 'PRODUCTION' : 'SANDBOX',
  version: clientVersion
});

export default phonePeClient;

// Export config for backward compatibility
export const phonePeConfig = {
  merchantId: clientId,
  saltKey: clientSecret,
  saltIndex: clientVersion,
  env: env
};
