import Wishlist from "../../model/user/Wishlist.js";

// Add product to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    const exists = await Wishlist.findOne({ user: userId, product: productId });
    if (exists) return res.status(400).json({ message: "Already in wishlist" });

    const wishlistItem = new Wishlist({ user: userId, product: productId });
    await wishlistItem.save();

    res.json({ message: "Product added to wishlist", wishlistItem });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove product from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.body;
    const userId = req.user._id;

    await Wishlist.findOneAndDelete({ user: userId, product: productId });
    res.json({ message: "Product removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get user's wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.user._id;
    const wishlist = await Wishlist.find({ user: userId }).populate("product");
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
