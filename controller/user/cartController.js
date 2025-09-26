// import Cart from "../../model/user/Cart.js";
// import Wishlist from "../../model/user/Wishlist.js";

// // Add product to cart (also removes from wishlist if exists)
// export const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity = 1 } = req.body;
//     const userId = req.user._id;

//     let cartItem = await Cart.findOne({ user: userId, product: productId });
//     if (cartItem) {
//       cartItem.quantity += quantity;
//       await cartItem.save();
//     } else {
//       cartItem = new Cart({ user: userId, product: productId, quantity });
//       await cartItem.save();
//     }

//     // Remove from wishlist
//     await Wishlist.findOneAndDelete({ user: userId, product: productId });

//     res.json({ message: "Product added to cart", cartItem });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Remove from cart (expects productId as param)
// export const removeFromCart = async (req, res) => {
//   try {
//     const { productId } = req.params;   // ✅ changed from body to params
//     const userId = req.user._id;

//     await Cart.findOneAndDelete({ user: userId, product: productId });
//     res.json({ message: "Product removed from cart" });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Update quantity
// export const updateCartQuantity = async (req, res) => {
//   try {
//     const { productId } = req.params;
//     const { quantity } = req.body;
//     const userId = req.user._id;

//     if (!quantity || quantity < 1) {
//       return res.status(400).json({ message: "Quantity must be at least 1" });
//     }

//     let cartItem = await Cart.findOne({ user: userId, product: productId });
//     if (!cartItem) {
//       return res.status(404).json({ message: "Product not found in cart" });
//     }

//     cartItem.quantity = quantity;
//     await cartItem.save();

//     res.json({ message: "Quantity updated", cartItem });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };

// // Get user's cart
// export const getCart = async (req, res) => {
//   try {
//     const userId = req.user._id;
//     const cart = await Cart.find({ user: userId }).populate("product");
//     res.json(cart);
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };











import Cart from "../../model/user/Cart.js";
import Wishlist from "../../model/user/Wishlist.js";
import productModel from "../../model/admin/productModel.js";

// Add product to cart (with variant support)
export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1, variant } = req.body;
    const userId = req.user._id;

    // Validate product exists
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create a unique identifier for cart item (product + variant combination)
    const cartQuery = { 
      user: userId, 
      product: productId 
    };

    // If variant is provided, include it in the query to find exact match
    if (variant && variant.name) {
      cartQuery['variant.name'] = variant.name;
    } else {
      cartQuery['variant.name'] = { $exists: false };
    }

    let cartItem = await Cart.findOne(cartQuery);
    
    if (cartItem) {
      // Update quantity if same product and variant exists
      cartItem.quantity += quantity;
      await cartItem.save();
    } else {
      // Create new cart item with variant data
      cartItem = new Cart({ 
        user: userId, 
        product: productId, 
        quantity,
        variant: variant || null
      });
      await cartItem.save();
    }

    // Remove from wishlist
    await Wishlist.findOneAndDelete({ user: userId, product: productId });

    // Populate product details for response
    await cartItem.populate('product');

    res.json({ message: "Product added to cart", cartItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove from cart (with variant support)
export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const { variantName } = req.query; // Optional variant name parameter
    const userId = req.user._id;

    const query = { user: userId, product: productId };
    
    // If variant name is provided, remove specific variant
    if (variantName) {
      query['variant.name'] = variantName;
    } else {
      query['variant.name'] = { $exists: false };
    }

    await Cart.findOneAndDelete(query);
    res.json({ message: "Product removed from cart" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update quantity (with variant support)
export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity, variantName } = req.body;
    const userId = req.user._id;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const query = { user: userId, product: productId };
    
    // If variant name is provided, update specific variant
    if (variantName) {
      query['variant.name'] = variantName;
    } else {
      query['variant.name'] = { $exists: false };
    }

    let cartItem = await Cart.findOne(query);
    if (!cartItem) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    await cartItem.populate('product');
    res.json({ message: "Quantity updated", cartItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's cart with populated products and variant support
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const cart = await Cart.find({ user: userId }).populate("product");
    
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};