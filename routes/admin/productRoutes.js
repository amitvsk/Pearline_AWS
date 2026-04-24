// import express from "express";
// import multer from "multer";
// import { createProduct, getProducts, getProductById, getFilters,getProductsByType, updateProduct, deleteProduct, getProductsByCollection, searchProducts } from "../../controller/admin/productController.js";

// const router = express.Router();
// const upload = multer(); // multer memory storage for S3


// router.get("/search", searchProducts);
// router.post(
//   "/",
//   upload.fields([
//     { name: "image", maxCount: 1 }, // main product image
//     { name: "images", maxCount: 10 }, // product gallery images
//     { name: "variantImages", maxCount: 50 }, // variant main images (one per variant)
//   ]),
//   createProduct,
// )


// router.get("/", getProducts);
// router.get("/filters", getFilters);
// router.get("/type/:type", getProductsByType);
// router.get("/collection/:collectionSlug", getProductsByCollection);
// router.get("/:id", getProductById);
// router.put("/:id", upload.array("images", 4), updateProduct);
// router.delete("/:id", deleteProduct);

// export default router;













import express from "express"
import multer from "multer"
import {
  createProduct,
  getProducts,
  getProductById,
  getFilters,
  getProductsByType,
  updateProduct,
  deleteProduct,
  getProductsByCollection,
  searchProducts,
} from "../../controller/admin/productController.js"

const router = express.Router()

// Configure multer for memory storage
const storage = multer.memoryStorage()
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
})

router.get("/search", searchProducts)

// Use upload.any() to accept all file fields dynamically
router.post("/", upload.any(), createProduct)

router.get("/", getProducts)
router.get("/filters", getFilters)
router.get("/type/:type", getProductsByType)
router.get("/collection/:collectionSlug", getProductsByCollection)
router.get("/:id", getProductById)

// Update route with proper file handling
router.put("/:id", upload.any(), updateProduct)

router.delete("/:id", deleteProduct)

export default router
