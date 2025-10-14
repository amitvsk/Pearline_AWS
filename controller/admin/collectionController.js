import Collection from "../../model/admin/collectionModel.js";
import Product from "../../model/admin/productModel.js"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const uploadToS3 = async (file) => {
  const fileKey = `${uuidv4()}${path.extname(file.originalname)}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    })
  );
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
};

// Add new collection
export const createCollection = async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToS3(req.file);
    }

    const collection = await Collection.create({
      image: imageUrl,
      title: req.body.title,
      link: req.body.link,
      homePageDisplay: req.body.homePageDisplay || false,
      pearlineCollection: req.body.pearlineCollection || "none",
      homePageDisplay2: req.body.homePageDisplay2 || false,
      pearlineCollection2: req.body.pearlineCollection2 || "none",
    });

    res.status(201).json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all collections
// export const getCollections = async (req, res) => {
//   try {
//     const collections = await Collection.find().sort({ createdAt: -1 });
//     res.json(collections);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Get products by collection
export const getProductsByCollection = async (req, res) => {
  try {
    const products = await Product.find({ collection: req.params.id })
      .populate("collection")
      .sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Update collection
export const updateCollection = async (req, res) => {
  try {
    let imageUrl;

    if (req.file) {
      // Upload new image if provided
      imageUrl = await uploadToS3(req.file);
    }

    const updatedData = {
      title: req.body.title,
      link: req.body.link,
      homePageDisplay: req.body.homePageDisplay || false,
      pearlineCollection: req.body.pearlineCollection || "none",
         homePageDisplay2: req.body.homePageDisplay2 || false,
      pearlineCollection2: req.body.pearlineCollection2 || "none",
    };

    if (imageUrl) updatedData.image = imageUrl;

    const collection = await Collection.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    if (!collection) return res.status(404).json({ message: "Collection not found" });

    res.json(collection);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete collection
export const deleteCollection = async (req, res) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) return res.status(404).json({ message: "Collection not found" });

    res.json({ message: "Collection deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get all collections (with optional filters)
export const getCollections = async (req, res) => {
  try {
    const query = {};

    // ✅ check homepage display query
    if (req.query.homePageDisplay) {
      query.homePageDisplay = req.query.homePageDisplay === "true";
    }

    // ✅ check pearline collection query
    if (req.query.pearlineCollection) {
      query.pearlineCollection = req.query.pearlineCollection;
    }

    const collections = await Collection.find(query).sort({ createdAt: -1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const getCollections2 = async (req, res) => {
  try {
    const query = {};

    // ✅ check homepage display query
    if (req.query.homePageDisplay2) {
      query.homePageDisplay2 = req.query.homePageDisplay2 === "true";
    }

    // ✅ check pearline collection query
    if (req.query.pearlineCollection2) {
      query.pearlineCollection2 = req.query.pearlineCollection2;
    }

    const collections = await Collection.find(query).sort({ createdAt: -1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
