import mongoose from "mongoose";

const userAddressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    address1: {
      type: String,
      required: true,
      trim: true,
    },
    address2: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    zip: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Ensure only one default address per user
userAddressSchema.pre("save", async function (next) {
  if (this.isDefault) {
    const UserAddressModel = mongoose.models.UserAddress || mongoose.model("UserAddress", userAddressSchema);
    await UserAddressModel.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { isDefault: false }
    );
  }
  next();
});

const UserAddress = mongoose.models.UserAddress || mongoose.model("UserAddress", userAddressSchema);
export default UserAddress;
