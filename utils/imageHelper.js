import dotenv from "dotenv";
dotenv.config();

/**
 * Convert relative URL to full URL (for local storage)
 * @param {string} url - The URL to convert
 * @returns {string} - Full URL or original URL
 */
export const convertToProxyUrl = (url) => {
  if (!url) return url;
  
  // If already a full URL, return as is
  if (url.startsWith('http')) {
    return url;
  }
  
  // If it's a relative path, convert to full URL
  if (url.startsWith('/uploads/')) {
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
    return `${baseUrl}${url}`;
  }
  
  return url;
};

/**
 * Process product images to convert relative URLs to full URLs
 * @param {Object} product - Product object with images
 * @returns {Object} - Product with converted image URLs
 */
export const processProductImages = (product) => {
  if (!product) return product;

  // Convert main product image
  if (product.image) {
    product.image = convertToProxyUrl(product.image);
  }

  // Convert product gallery images
  if (product.images && Array.isArray(product.images)) {
    product.images = product.images.map(img => convertToProxyUrl(img));
  }

  // Convert variant images
  if (product.variants && Array.isArray(product.variants)) {
    product.variants = product.variants.map(variant => {
      if (variant.image) {
        variant.image = convertToProxyUrl(variant.image);
      }
      if (variant.images && Array.isArray(variant.images)) {
        variant.images = variant.images.map(img => convertToProxyUrl(img));
      }
      return variant;
    });
  }

  return product;
};
