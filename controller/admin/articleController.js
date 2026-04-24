import dotenv from "dotenv";
import articleModel from "../../model/admin/articleModel.js";
import { saveToLocal, deleteFromLocal, toFullUrl } from "../../utils/localStorage.js";

dotenv.config();

// ================= CRUD Controllers =================

// Create article
export const createArticle = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image is required" });

    const imageUrl = await saveToLocal(req.file);

    const article = await articleModel.create({
      image: imageUrl,
      badge: req.body.badge,
      title: req.body.title,
      description: req.body.description,
      category: req.body.category,
      date: req.body.date,
      readTime: req.body.readTime
    });

    res.status(201).json({ message: "Article created successfully", article });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all articles
export const getArticles = async (req, res) => {
  try {
    const articles = await articleModel.find().sort({ createdAt: -1 });
    const processedArticles = articles.map(article => {
      const articleObj = article.toObject();
      if (articleObj.image) articleObj.image = toFullUrl(articleObj.image);
      return articleObj;
    });
    res.status(200).json(processedArticles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get article by ID
export const getArticleById = async (req, res) => {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });
    
    const articleObj = article.toObject();
    if (articleObj.image) articleObj.image = toFullUrl(articleObj.image);
    
    res.status(200).json(articleObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update article
export const updateArticle = async (req, res) => {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    if (req.file) {
      await deleteFromLocal(article.image);
      article.image = await saveToLocal(req.file);
    }

    article.badge = req.body.badge || article.badge;
    article.title = req.body.title || article.title;
    article.description = req.body.description || article.description;
    article.category = req.body.category || article.category;
    article.date = req.body.date || article.date;
    article.readTime = req.body.readTime || article.readTime;

    await article.save();
    res.status(200).json({ message: "Article updated successfully", article });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete article
export const deleteArticle = async (req, res) => {
  try {
    const article = await articleModel.findById(req.params.id);
    if (!article) return res.status(404).json({ message: "Article not found" });

    await deleteFromLocal(article.image);
    await article.deleteOne();

    res.status(200).json({ message: "Article deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
