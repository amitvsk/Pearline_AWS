// import productModel from "../../model/admin/productModel.js";
// import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
// import { v4 as uuidv4 } from "uuid";
// import dotenv from "dotenv";
// import path from "path";
// import collectionModel from "../../model/admin/collectionModel.js";
// dotenv.config();

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//   },
// });

// const uploadToS3 = async (file) => {
//   const fileKey = `${uuidv4()}${path.extname(file.originalname)}`;
//   await s3.send(new PutObjectCommand({
//     Bucket: process.env.AWS_BUCKET_NAME,
//     Key: fileKey,
//     Body: file.buffer,
//     ContentType: file.mimetype,
//   }));
//   return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
// };

// const deleteFromS3 = async (fileUrl) => {
//   const key = fileUrl.split("/").pop();
//   await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }));
// };


// // Create Product
// // export const createProduct = async (req, res) => {
// //     try {
// //     // Main image
// //     const mainImageFile = req.files["image"]?.[0];
// //     const mainImageUrl = mainImageFile ? await uploadToS3(mainImageFile) : "";

// //     // Gallery images
// //     const galleryFiles = req.files["images"] || [];
// //     const galleryUrls = [];
// //     for (const file of galleryFiles) {
// //       galleryUrls.push(await uploadToS3(file));
// //     }

// //     // Variant images
// //     const variantFiles = req.files["variantImages"] || [];
// //     const variantUrls = [];
// //     for (const file of variantFiles) {
// //       variantUrls.push(await uploadToS3(file));
// //     }

// //     const product = await productModel.create({
// //      image: mainImageUrl,
// //       images: galleryUrls,
// //       variantImages: variantUrls,

// //       product: req.body.product,
// //       category: req.body.category,
// //       collection: req.body.collection,
// //       type: req.body.type,
// //       metal: req.body.metal,

// //       price: req.body.price,
// //       usdPrice: req.body.usdPrice,    // ✅ USD
// //       stock: req.body.stock,
// //       discount: req.body.discount,
// //       rating: req.body.rating,
// //       status: req.body.status,

// //       description: req.body.description,
// //       details: req.body.details,
// //       careInstructions: req.body.careInstructions,
// //       shippingAndReturn: req.body.shippingAndReturn,

// //       reviews: req.body.reviews ? JSON.parse(req.body.reviews) : [],
// //       variants: req.body.variants ? JSON.parse(req.body.variants) : [],
// //     });

// //     res.status(201).json(product);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };
// // export const createProduct = async (req, res) => {
// //   try {
// //     // Main image
// //     const mainImageFile = req.files["image"]?.[0];
// //     const mainImageUrl = mainImageFile ? await uploadToS3(mainImageFile) : "";

// //     // Gallery images
// //     const galleryFiles = req.files["images"] || [];
// //     const galleryUrls = [];
// //     for (const file of galleryFiles) {
// //       galleryUrls.push(await uploadToS3(file));
// //     }

// //     // Variants
// //     let variants = [];
// //     if (req.body.variants) {
// //       try {
// //         variants = JSON.parse(req.body.variants);
// //       } catch (err) {
// //         variants = [];
// //       }
// //     }

// //     const variantFiles = req.files["variantImages"] || [];
// //     for (let i = 0; i < variants.length; i++) {
// //       if (variantFiles[i]) {
// //         variants[i].image = await uploadToS3(variantFiles[i]);
// //       } else {
// //         variants[i].image = ""; // or throw error
// //       }
// //     }

// //     // Create product
// //     const product = await productModel.create({
// //       image: mainImageUrl,
// //       images: galleryUrls,
// //       variants: variants,
// //       product: req.body.product,
// //       category: req.body.category,
// //       collection: req.body.collection,
// //       type: req.body.type,
// //       metal: req.body.metal,
// //       price: req.body.price,
// //       usdPrice: req.body.usdPrice,
// //       discount: req.body.discount,
// //       stock: req.body.stock,
// //       rating: req.body.rating,
// //       status: req.body.status,
// //       description: req.body.description,
// //       details: req.body.details,
// //       careInstructions: req.body.careInstructions,
// //       shippingAndReturn: req.body.shippingAndReturn,
// //       reviews: req.body.reviews ? JSON.parse(req.body.reviews) : [],
// //     });

// //     res.status(201).json(product);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };



// export const createProduct = async (req, res) => {
//   try {
//     // ✅ Main product image
//     const mainImageFile = req.files?.["image"]?.[0];
//     const mainImageUrl = mainImageFile ? await uploadToS3(mainImageFile) : "";

//     // ✅ Product gallery images
//     const galleryFiles = req.files?.["images"] || [];
//     const galleryUrls = await Promise.all(
//       galleryFiles.map(file => uploadToS3(file))
//     );

//     // ✅ Parse variants safely
//     let variants = [];
//     if (req.body.variants) {
//       try {
//         variants = JSON.parse(req.body.variants);
//       } catch {
//         variants = [];
//       }
//     }

//     // ✅ Variant files
//     const variantMainFiles = req.files?.["image"] || [];   // single main image per variant
//     const variantGalleryFiles = req.files?.["images"] || []; // multiple gallery images per variant

//     // ✅ Loop through each variant
//     for (let i = 0; i < variants.length; i++) {
//       // --- Main image
//       if (variantMainFiles[i]) {
//         variants[i].image = await uploadToS3(variantMainFiles[i]);
//       } else if (!variants[i].image) {
//         variants[i].image = ""; // fallback if not provided
//       }

//       // --- Gallery images
//       if (variantGalleryFiles[i]) {
//         // Ensure it's always an array
//         const galleryArray = Array.isArray(variantGalleryFiles[i])
//           ? variantGalleryFiles[i]
//           : [variantGalleryFiles[i]];

//         variants[i].images = await Promise.all(
//           galleryArray.map(file => uploadToS3(file))
//         );
//       } else if (!variants[i].images) {
//         variants[i].images = [];
//       }
//     }

//     // ✅ Parse reviews safely
//     let reviews = [];
//     if (req.body.reviews) {
//       try {
//         reviews = JSON.parse(req.body.reviews);
//       } catch {
//         reviews = [];
//       }
//     }

//     // ✅ Create product
//     const product = await productModel.create({
//       image: mainImageUrl,
//       images: galleryUrls,
//       variants,
//       product: req.body.product,
//       category: req.body.category,
//       collection: req.body.collection || null,
//       type: req.body.type || "",
//       metal: req.body.metal || "",
//       price: req.body.price,
//       usdPrice: req.body.usdPrice || null,
//       discount: req.body.discount || 0,
//       usdDiscount: req.body.usdDiscount || 0,
//       stock: req.body.stock || 0,
//       rating: req.body.rating || 0,
//       status: req.body.status || "Available",
//       description: req.body.description || "",
//       details: req.body.details || "",
//       careInstructions: req.body.careInstructions || "",
//       shippingAndReturn: req.body.shippingAndReturn || "",
//       reviews,
//     });

//     return res.status(201).json(product);
//   } catch (err) {
//     console.error("❌ Error creating product:", err);
//     return res.status(500).json({ message: err.message });
//   }
// };



// export const updateProduct = async (req, res) => {
//   try {
//     const product = await productModel.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     // handle new image uploads
//     if (req.files && req.files.length > 0) {
//       // delete old S3 images
//       if (product.images && product.images.length > 0) {
//         for (const img of product.images) {
//           await deleteFromS3(img);
//         }
//       }

//       let uploadedUrls = [];
//       for (const file of req.files) {
//         const url = await uploadToS3(file);
//         uploadedUrls.push(url);
//       }

//       product.image = uploadedUrls[0];
//       product.images = uploadedUrls;
//     }

//     // normal fields
//     product.product = req.body.product;
//     product.category = req.body.category;
//     product.collection = req.body.collection;
//     product.type = req.body.type;
//     product.metal = req.body.metal;
//     product.price = req.body.price;
//     product.usdPrice = req.body.usdPrice;
//     product.discount = req.body.discount;
//     product.stock = req.body.stock;
//     product.rating = req.body.rating;
//     product.status = req.body.status;
//     product.description = req.body.description;
//     product.details = req.body.details;
//     product.careInstructions = req.body.careInstructions;
//     product.shippingAndReturn = req.body.shippingAndReturn;

//     // ✅ parse reviews safely
//     if (req.body.reviews) {
//       try {
//         product.reviews = JSON.parse(req.body.reviews);
//       } catch (e) {
//         product.reviews = [];
//       }
//     }

//     if (req.body.variants) {
//   try {
//     product.variants = JSON.parse(req.body.variants);
//   } catch (e) {
//     product.variants = [];
//   }
// }


//     await product.save();
//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };



// // Get All Products
// export const getProducts = async (req, res) => {
//   try {
//     const products = await productModel.find()
//       .sort({ createdAt: -1 })
//       .populate("collection", "title"); // 👈 fetch only _id + title from collection
//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get Product by ID
// export const getProductById = async (req, res) => {
//   try {
//     const product = await productModel.findById(req.params.id)
//       .populate("collection", "title");
//     if (!product) return res.status(404).json({ message: "Product not found" });
//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


// // Update Product
// // export const updateProduct = async (req, res) => {
// //   try {
// //     const product = await productModel.findById(req.params.id);
// //     if (!product) return res.status(404).json({ message: "Product not found" });

// //     if (req.file) {
// //       if (product.image) await deleteFromS3(product.image);
// //       product.image = await uploadToS3(req.file);
// //     }

// //     product.product = req.body.product;
// //     product.category = req.body.category;
// //     product.collection = req.body.collection;
// //     product.metal = req.body.metal;
// //     product.type = req.body.type;
// //     product.price = req.body.price;
// //     product.discount=req.body.discount;
// //     product.stock = req.body.stock;
// //     product.rating = req.body.rating;
// //     product.status = req.body.status;

// //     await product.save();
// //     res.status(200).json(product);
// //   } catch (err) {
// //     res.status(500).json({ message: err.message });
// //   }
// // };

// // Delete Product
// export const deleteProduct = async (req, res) => {
//   try {
//     const product = await productModel.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     if (product.image) await deleteFromS3(product.image);
//     await product.deleteOne();

//     res.status(200).json({ message: "Deleted successfully" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };
// // GET /product/filters
// export const getFilters = async (req, res) => {
//   try {
//     const categories = await productModel.distinct("category");
//     const collections = await productModel.distinct("collection");
//     const metals = await productModel.distinct("metal");
//     const types = await productModel.distinct("type");   // ✅ add this

//     res.json({ categories, collections, metals, types }); // ✅ include types
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Get Products by Type (bestsellers, featured, new arrivals)
// export const getProductsByType = async (req, res) => {
//   try {
//     const { type } = req.params; // e.g., "bestseller", "featured", "new"
//     const products = await productModel.find({ type }).sort({ createdAt: -1 });
//     res.status(200).json(products);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// export const getProductsByCollection = async (req, res) => {
//   try {
//     const { collectionSlug } = req.params; // e.g. "summer"

//     // Find the collection by slug (assuming "link" field holds "summer")
//     const collection = await collectionModel.findOne({ title: collectionSlug });

//     if (!collection) {
//       return res.status(404).json({ success: false, message: "Collection not found" });
//     }

//     // Find all products linked to this collection
//      const products = await productModel.find({ collection: collection._id });

//     res.status(200).json({
//       success: true,
//       collection: collection.title,
//       products,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };

// export const searchProducts = async (req, res) => {
//   try {
//     let { keyword } = req.query;
//     if (!keyword || keyword.trim() === "") {
//       return res.status(400).json({ success: false, message: "Keyword is required" });
//     }

//     keyword = keyword.trim();

//     // Build $or array only for existing fields
//     const searchFields = ["product", "category", "metal", "description", "details"];
//     const orQuery = searchFields.map((field) => ({
//       [field]: { $regex: keyword, $options: "i" },
//     }));

//     const products = await productModel.find({ $or: orQuery }).populate("collection", "title link");

//     // If nothing matches, products will be empty
//     res.status(200).json({
//       success: true,
//       count: products.length,
//       products,
//     });
//   } catch (err) {
//     res.status(500).json({ success: false, message: err.message });
//   }
// };













import productModel from "../../model/admin/productModel.js"
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { v4 as uuidv4 } from "uuid"
import dotenv from "dotenv"
import path from "path"
import collectionModel from "../../model/admin/collectionModel.js"
dotenv.config()

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const uploadToS3 = async (file) => {
  const fileKey = `${uuidv4()}${path.extname(file.originalname)}`
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    }),
  )
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`
}

const deleteFromS3 = async (fileUrl) => {
  const key = fileUrl.split("/").pop()
  await s3.send(new DeleteObjectCommand({ Bucket: process.env.AWS_BUCKET_NAME, Key: key }))
}

export const createProduct = async (req, res) => {
  try {
    // Main product image (single)
    const mainImageFile = (req.files || []).find((f) => f.fieldname === "image")
    const mainImageUrl = mainImageFile ? await uploadToS3(mainImageFile) : ""

    // Product gallery images (multiple 'images')
    const productGalleryFiles = (req.files || []).filter((f) => f.fieldname === "images")
    const galleryUrls = await Promise.all(productGalleryFiles.map((f) => uploadToS3(f)))

    // Variants JSON
    let variants = []
    if (req.body.variants) {
      try {
        variants = JSON.parse(req.body.variants)
      } catch {
        variants = []
      }
    }

    // Variant main images appended under 'variantImages' (one per variant, optional)
    const variantMainFiles = (req.files || []).filter((f) => f.fieldname === "variantImages")

    const variantGalleryMap = {}
    ;(req.files || [])
      .filter((f) => /^variantImages_\d+$/.test(f.fieldname))
      .forEach((f) => {
        const idx = Number(f.fieldname.split("_")[1])
        if (!Number.isNaN(idx)) {
          if (!variantGalleryMap[idx]) variantGalleryMap[idx] = []
          variantGalleryMap[idx].push(f)
        }
      })

    // Build each variant
    for (let i = 0; i < variants.length; i++) {
      // Variant main image (optional, based on order of variantImages)
      if (variantMainFiles[i]) {
        variants[i].image = await uploadToS3(variantMainFiles[i])
      } else if (!variants[i].image) {
        variants[i].image = ""
      }

      // Variant gallery images
      const files = variantGalleryMap[i] || []
      if (files.length > 0) {
        const urls = await Promise.all(files.map((f) => uploadToS3(f)))
        variants[i].images = urls
        // If no explicit main image, set to first gallery
        if (!variants[i].image && urls.length > 0) {
          variants[i].image = urls[0]
        }
      } else if (!Array.isArray(variants[i].images)) {
        variants[i].images = []
      }

      // Ensure all variant fields from model exist (defaulting)
      variants[i].name = variants[i].name || ""
      variants[i].price = variants[i].price ?? 0
      variants[i].discount = variants[i].discount ?? 0
      variants[i].usdPrice = variants[i].usdPrice ?? null //
      variants[i].usdDiscount = variants[i].usdDiscount ?? 0
      variants[i].color = variants[i].color || ""
      variants[i].stock = variants[i].stock ?? 0
      variants[i].rating = variants[i].rating ?? 0
      variants[i].status = variants[i].status || "Available"
    }

    // Reviews
    let reviews = []
    if (req.body.reviews) {
      try {
        reviews = JSON.parse(req.body.reviews)
      } catch {
        reviews = []
      }
    }

    // Create product including all model fields
    const product = await productModel.create({
      image: mainImageUrl,
      images: galleryUrls,
      variants,
      product: req.body.product,
      category: req.body.category,
      collection: req.body.collection || null,
      type: req.body.type || "",
      metal: req.body.metal || "",
      price: req.body.price,
      usdPrice: req.body.usdPrice || null,
      discount: req.body.discount || 0,
      usdDiscount: req.body.usdDiscount || 0,
      stock: req.body.stock || 0,
      rating: req.body.rating || 0,
      status: req.body.status || "Available",
      description: req.body.description || "",
      details: req.body.details || "",
      careInstructions: req.body.careInstructions || "",
      shippingAndReturn: req.body.shippingAndReturn || "",
      reviews,
    })

    return res.status(201).json(product)
  } catch (err) {
    console.error("❌ Error creating product:", err)
    return res.status(500).json({ message: err.message })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id)
    if (!product) return res.status(404).json({ message: "Product not found" })

    // handle new image uploads
    if (req.files && req.files.length > 0) {
      // delete old S3 images
      if (product.images && product.images.length > 0) {
        for (const img of product.images) {
          await deleteFromS3(img)
        }
      }

      const uploadedUrls = []
      for (const file of req.files) {
        const url = await uploadToS3(file)
        uploadedUrls.push(url)
      }

      product.image = uploadedUrls[0]
      product.images = uploadedUrls
    }

    // normal fields
    product.product = req.body.product
    product.category = req.body.category
    product.collection = req.body.collection
    product.type = req.body.type
    product.metal = req.body.metal
    product.price = req.body.price
    product.usdPrice = req.body.usdPrice
    product.discount = req.body.discount
    product.stock = req.body.stock
    product.rating = req.body.rating
    product.status = req.body.status
    product.description = req.body.description
    product.details = req.body.details
    product.careInstructions = req.body.careInstructions
    product.shippingAndReturn = req.body.shippingAndReturn

    // ✅ parse reviews safely
    if (req.body.reviews) {
      try {
        product.reviews = JSON.parse(req.body.reviews)
      } catch (e) {
        product.reviews = []
      }
    }

    if (req.body.variants) {
      try {
        product.variants = JSON.parse(req.body.variants)
      } catch (e) {
        product.variants = []
      }
    }

    await product.save()
    res.status(200).json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await productModel.find().sort({ createdAt: -1 }).populate("collection", "title") // 👈 fetch only _id + title from collection
    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Get Product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id).populate("collection", "title")
    if (!product) return res.status(404).json({ message: "Product not found" })
    res.status(200).json(product)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// Update Product
// export const updateProduct = async (req, res) => {
//   try {
//     const product = await productModel.findById(req.params.id);
//     if (!product) return res.status(404).json({ message: "Product not found" });

//     if (req.file) {
//       if (product.image) await deleteFromS3(product.image);
//       product.image = await uploadToS3(req.file);
//     }

//     product.product = req.body.product;
//     product.category = req.body.category;
//     product.collection = req.body.collection;
//     product.metal = req.body.metal;
//     product.type = req.body.type;
//     product.price = req.body.price;
//     product.discount=req.body.discount;
//     product.stock = req.body.stock;
//     product.rating = req.body.rating;
//     product.status = req.body.status;

//     await product.save();
//     res.status(200).json(product);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const product = await productModel.findById(req.params.id)
    if (!product) return res.status(404).json({ message: "Product not found" })

    if (product.image) await deleteFromS3(product.image)
    await product.deleteOne()

    res.status(200).json({ message: "Deleted successfully" })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}
// GET /product/filters
export const getFilters = async (req, res) => {
  try {
    const categories = await productModel.distinct("category")
    const collections = await productModel.distinct("collection")
    const metals = await productModel.distinct("metal")
    const types = await productModel.distinct("type") // ✅ add this

    res.json({ categories, collections, metals, types }) // ✅ include types
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

// Get Products by Type (bestsellers, featured, new arrivals)
export const getProductsByType = async (req, res) => {
  try {
    const { type } = req.params // e.g., "bestseller", "featured", "new"
    const products = await productModel.find({ type }).sort({ createdAt: -1 })
    res.status(200).json(products)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

export const getProductsByCollection = async (req, res) => {
  try {
    const { collectionSlug } = req.params // e.g. "summer"

    // Find the collection by slug (assuming "link" field holds "summer")
    const collection = await collectionModel.findOne({ title: collectionSlug })

    if (!collection) {
      return res.status(404).json({ success: false, message: "Collection not found" })
    }

    // Find all products linked to this collection
    const products = await productModel.find({ collection: collection._id })

    res.status(200).json({
      success: true,
      collection: collection.title,
      products,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}

export const searchProducts = async (req, res) => {
  try {
    let { keyword } = req.query
    if (!keyword || keyword.trim() === "") {
      return res.status(400).json({ success: false, message: "Keyword is required" })
    }

    keyword = keyword.trim()

    // Build $or array only for existing fields
    const searchFields = ["product", "category", "metal", "description", "details"]
    const orQuery = searchFields.map((field) => ({
      [field]: { $regex: keyword, $options: "i" },
    }))

    const products = await productModel.find({ $or: orQuery }).populate("collection", "title link")

    // If nothing matches, products will be empty
    res.status(200).json({
      success: true,
      count: products.length,
      products,
    })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
}


