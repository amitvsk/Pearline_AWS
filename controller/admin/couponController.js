import Coupon from "../../model/admin/Coupon.js";

// Create coupon (admin only)
export const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ message: "Coupon created", coupon });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all coupons (admin)
export const getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Validate and apply coupon (user)
export const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });

    if (!coupon) return res.status(404).json({ message: "Invalid or expired coupon" });
    if (coupon.expiresAt < new Date()) return res.status(400).json({ message: "Coupon expired" });
    if (cartTotal < coupon.minPurchase)
      return res.status(400).json({ message: `Minimum purchase ₹${coupon.minPurchase} required` });

    let discount = 0;

    if (coupon.discountType === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalTotal = Math.max(cartTotal - discount, 0);

    res.json({
      message: "Coupon applied successfully",
      discount,
      finalTotal,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete coupon (admin)
export const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
