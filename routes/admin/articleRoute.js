import express from "express";
import multer from "multer";
import { 
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  deleteArticle
} from "../../controller/admin/articleController.js";

const articleRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
articleRouter.post("/", upload.single("image"), createArticle);
articleRouter.get("/", getArticles);
articleRouter.get("/:id", getArticleById);
articleRouter.put("/:id", upload.single("image"), updateArticle);
articleRouter.delete("/:id", deleteArticle);

export default articleRouter;
