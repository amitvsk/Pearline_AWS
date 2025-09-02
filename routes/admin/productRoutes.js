import express from "express";
import multer from "multer";
import { createProduct, getProducts, getProductById, getFilters,getProductsByType, updateProduct, deleteProduct, getProductsByCollection, searchProducts } from "../../controller/admin/productController.js";

const router = express.Router();
const upload = multer(); // multer memory storage for S3


router.get("/search", searchProducts);
router.post("/", upload.array("images", 4), createProduct);
router.get("/", getProducts);
router.get("/filters", getFilters);
router.get("/type/:type", getProductsByType);
router.get("/collection/:collectionSlug", getProductsByCollection);
router.get("/:id", getProductById);
router.put("/:id", upload.array("images", 4), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
