import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Save file to local storage
 * @param {Object} file - Multer file object
 * @returns {string} - File URL (relative path)
 */
export const saveToLocal = async (file) => {
  try {
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Return relative URL
    return `/uploads/${fileName}`;
  } catch (error) {
    console.error("Error saving file to local storage:", error);
    throw error;
  }
};

/**
 * Delete file from local storage
 * @param {string} fileUrl - File URL to delete
 */
export const deleteFromLocal = async (fileUrl) => {
  try {
    if (!fileUrl) return;
    
    // Skip if it's an AWS S3 URL (old data)
    if (fileUrl.includes("amazonaws.com") || fileUrl.includes("s3.")) {
      console.log(`⚠️ Skipping AWS S3 URL deletion: ${fileUrl}`);
      return;
    }
    
    if (!fileUrl.includes("/uploads/")) return;

    const fileName = fileUrl.split("/uploads/")[1];
    if (!fileName) return;
    
    const filePath = path.join(uploadsDir, fileName);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted file: ${fileName}`);
    }
  } catch (error) {
    console.error("Error deleting file from local storage:", error);
  }
};

/**
 * Convert relative URL to full URL
 * @param {string} relativePath - Relative path from saveToLocal
 * @returns {string} - Full URL
 */
export const toFullUrl = (relativePath) => {
  if (!relativePath) return relativePath;
  
  // If it's already a full URL (including old AWS S3 URLs), return as-is
  if (relativePath.startsWith("http")) return relativePath;
  
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 8000}`;
  return `${baseUrl}${relativePath}`;
};

/**
 * Convert multiple relative URLs to full URLs
 * @param {Array} paths - Array of relative paths
 * @returns {Array} - Array of full URLs
 */
export const toFullUrls = (paths) => {
  if (!Array.isArray(paths)) return paths;
  return paths.map(p => toFullUrl(p));
};
