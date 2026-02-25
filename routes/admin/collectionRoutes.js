import express from "express";
import multer from "multer";
import {
  createCollection,
  getCollections,
  getProductsByCollection,
  getProductsByCollectionTitle,
  updateCollection,
  deleteCollection
} from "../../controller/admin/collectionController.js";

const router = express.Router();
const upload = multer();

router.post("/", upload.single("image"), createCollection);
router.get("/", getCollections);
router.get("/title/:title", getProductsByCollectionTitle);  // New route for title-based lookup
router.get("/:id", getProductsByCollection);
router.put("/:id", upload.single("image"), updateCollection);  // ✅ update
router.delete("/:id", deleteCollection);   
export default router;
