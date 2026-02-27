/**
 * PhonePe Payment Gateway SDK Wrapper
 * This is a custom SDK wrapper for PhonePe API
 * PhonePe doesn't provide an official Node.js SDK
 */

import crypto from 'crypto';
import axios from 'axios';

class PhonePeSDK {
  constructor(config) {
    this.merchantId = config.merchantId;
    this.saltKey = config.saltKey;
    this.saltIndex = config.saltIndex;
    this.apiUrl = config.apiUrl;
    this.redirectUrl = config.redirectUrl;
    this.callbackUrl = config.callbackUrl;
    this.env = config.env || 'production'; // 'production' or 'uat'
  }

  /**
   * Generate SHA256 hash for X-VERIFY header
   */
  _generateHash(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate X-VERIFY header for API requests
   */
  _generateXVerify(payload, endpoint) {
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const stringToHash = base64Payload + endpoint + this.saltKey;
    const hash = this._generateHash(stringToHash);
    return `${hash}###${this.saltIndex}`;
  }

  /**
   * Generate X-VERIFY for status check
   */
  _generateStatusXVerify(merchantTransactionId) {
    const endpoint = `/pg/v1/status/${this.merchantId}/${merchantTransactionId}`;
    const stringToHash = endpoint + this.saltKey;
    const hash = this._generateHash(stringToHash);
    return `${hash}###${this.saltIndex}`;
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(xVerify, base64Response) {
    const stringToHash = base64Response + this.saltKey;
    const hash = this._generateHash(stringToHash);
    const expectedXVerify = `${hash}###${this.saltIndex}`;
    return xVerify === expectedXVerify;
  }

  /**
   * Decode webhook response
   */
  decodeWebhookResponse(base64Response) {
    try {
      const decoded = Buffer.from(base64Response, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (error) {
      throw new Error('Failed to decode webhook response: ' + error.message);
    }
  }

  /**
   * Create payment request
   * @param {Object} options - Payment options
   * @param {string} options.merchantTransactionId - Unique transaction ID
   * @param {number} options.amount - Amount in rupees (will be converted to paise)
   * @param {string} options.merchantUserId - User ID
   * @param {string} options.mobileNumber - User mobile number
   * @param {string} options.redirectUrl - Custom redirect URL (optional)
   * @param {string} options.callbackUrl - Custom callback URL (optional)
   * @param {Object} options.paymentInstrument - Payment instrument config (optional)
   */
  async createPayment(options) {
    const {
      merchantTransactionId,
      amount,
      merchantUserId,
      mobileNumber,
      redirectUrl = this.redirectUrl,
      callbackUrl = this.callbackUrl,
      paymentInstrument = { type: 'PAY_PAGE' }
    } = options;

    // Validate required fields
    if (!merchantTransactionId || !amount || !merchantUserId) {
      throw new Error('merchantTransactionId, amount, and merchantUserId are required');
    }

    const payload = {
      merchantId: this.merchantId,
      merchantTransactionId,
      merchantUserId,
      amount: Math.round(amount * 100), // Convert to paise
      redirectUrl: `${redirectUrl}?merchantTransactionId=${merchantTransactionId}`,
      redirectMode: 'POST',
      callbackUrl,
      mobileNumber: mobileNumber || '9999999999',
      paymentInstrument
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerify = this._generateXVerify(payload, '/pg/v1/pay');

    try {
      const response = await axios.post(
        `${this.apiUrl}/pg/v1/pay`,
        { request: base64Payload },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      return {
        success: response.data.success,
        code: response.data.code,
        message: response.data.message,
        data: response.data.data,
        paymentUrl: response.data.data?.instrumentResponse?.redirectInfo?.url
      };
    } catch (error) {
      console.error('PhonePe Payment Creation Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Payment creation failed');
    }
  }

  /**
   * Check payment status
   * @param {string} merchantTransactionId - Transaction ID to check
   */
  async checkStatus(merchantTransactionId) {
    const xVerify = this._generateStatusXVerify(merchantTransactionId);

    try {
      const response = await axios.get(
        `${this.apiUrl}/pg/v1/status/${this.merchantId}/${merchantTransactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      return {
        success: response.data.success,
        code: response.data.code,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      console.error('PhonePe Status Check Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Status check failed');
    }
  }

  /**
   * Initiate refund
   * @param {Object} options - Refund options
   * @param {string} options.merchantTransactionId - Original transaction ID
   * @param {string} options.refundTransactionId - Unique refund transaction ID
   * @param {number} options.amount - Refund amount in rupees
   * @param {string} options.merchantUserId - User ID
   */
  async initiateRefund(options) {
    const {
      merchantTransactionId,
      refundTransactionId,
      amount,
      merchantUserId
    } = options;

    if (!merchantTransactionId || !refundTransactionId || !amount || !merchantUserId) {
      throw new Error('All refund parameters are required');
    }

    const payload = {
      merchantId: this.merchantId,
      merchantUserId,
      originalTransactionId: merchantTransactionId,
      merchantTransactionId: refundTransactionId,
      amount: Math.round(amount * 100), // Convert to paise
      callbackUrl: this.callbackUrl
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerify = this._generateXVerify(payload, '/pg/v1/refund');

    try {
      const response = await axios.post(
        `${this.apiUrl}/pg/v1/refund`,
        { request: base64Payload },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      return {
        success: response.data.success,
        code: response.data.code,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      console.error('PhonePe Refund Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Refund initiation failed');
    }
  }

  /**
   * Check refund status
   * @param {string} refundTransactionId - Refund transaction ID
   */
  async checkRefundStatus(refundTransactionId) {
    const xVerify = this._generateStatusXVerify(refundTransactionId);

    try {
      const response = await axios.get(
        `${this.apiUrl}/pg/v1/status/${this.merchantId}/${refundTransactionId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      return {
        success: response.data.success,
        code: response.data.code,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      console.error('PhonePe Refund Status Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Refund status check failed');
    }
  }

  /**
   * Validate VPA (UPI ID)
   * @param {string} vpa - UPI ID to validate
   */
  async validateVPA(vpa) {
    const payload = {
      merchantId: this.merchantId,
      vpa
    };

    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const xVerify = this._generateXVerify(payload, '/pg/v1/vpa/validate');

    try {
      const response = await axios.post(
        `${this.apiUrl}/pg/v1/vpa/validate`,
        { request: base64Payload },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-VERIFY': xVerify,
            'accept': 'application/json'
          }
        }
      );

      return {
        success: response.data.success,
        code: response.data.code,
        message: response.data.message,
        data: response.data.data
      };
    } catch (error) {
      console.error('PhonePe VPA Validation Error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'VPA validation failed');
    }
  }

  /**
   * Handle webhook callback
   * @param {string} xVerify - X-VERIFY header from webhook
   * @param {string} base64Response - Base64 encoded response from webhook
   */
  handleWebhook(xVerify, base64Response) {
    // Verify signature
    if (!this.verifyWebhookSignature(xVerify, base64Response)) {
      throw new Error('Invalid webhook signature');
    }

    // Decode and return response
    return this.decodeWebhookResponse(base64Response);
  }

  /**
   * Generate unique transaction ID
   */
  static generateTransactionId(prefix = 'TXN') {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `${prefix}_${timestamp}_${random}`;
  }

  /**
   * Check if payment is successful
   */
  static isPaymentSuccessful(statusResponse) {
    return statusResponse.success && 
           statusResponse.code === 'PAYMENT_SUCCESS' &&
           statusResponse.data?.state === 'COMPLETED';
  }

  /**
   * Check if payment is pending
   */
  static isPaymentPending(statusResponse) {
    return statusResponse.code === 'PAYMENT_PENDING' ||
           statusResponse.data?.state === 'PENDING';
  }

  /**
   * Check if payment failed
   */
  static isPaymentFailed(statusResponse) {
    return !statusResponse.success || 
           statusResponse.code === 'PAYMENT_ERROR' ||
           statusResponse.data?.state === 'FAILED';
  }
}

export default PhonePeSDK;
