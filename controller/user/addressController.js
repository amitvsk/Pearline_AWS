import UserAddress from "../../model/user/Address.js";

// Get all addresses for logged-in user
export const getUserAddresses = async (req, res) => {
  try {
    const userId = req.user._id;
    const addresses = await UserAddress.find({ user: userId }).sort({ isDefault: -1, createdAt: -1 });
    
    res.status(200).json({
      success: true,
      addresses,
    });
  } catch (err) {
    console.error("Get addresses error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Add new address
export const addAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { firstName, lastName, email, phone, address1, address2, city, state, country, zip, isDefault } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !address1 || !city || !state || !country || !zip) {
      return res.status(400).json({ message: "All required fields must be filled" });
    }

    // Check for duplicate address
    const existingAddress = await UserAddress.findOne({
      user: userId,
      address1: address1.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
    });

    if (existingAddress) {
      return res.status(400).json({ 
        message: "This address already exists",
        address: existingAddress 
      });
    }

    // If this is the first address, make it default
    const existingAddresses = await UserAddress.find({ user: userId });
    const shouldBeDefault = existingAddresses.length === 0 || isDefault;

    const newAddress = new UserAddress({
      user: userId,
      firstName,
      lastName,
      email,
      phone,
      address1,
      address2,
      city,
      state,
      country,
      zip,
      isDefault: shouldBeDefault,
    });

    await newAddress.save();

    res.status(201).json({
      success: true,
      message: "Address added successfully",
      address: newAddress,
    });
  } catch (err) {
    console.error("Add address error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Update address
export const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;
    const { firstName, lastName, email, phone, address1, address2, city, state, country, zip, isDefault } = req.body;

    const address = await UserAddress.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Update fields
    address.firstName = firstName || address.firstName;
    address.lastName = lastName || address.lastName;
    address.email = email || address.email;
    address.phone = phone || address.phone;
    address.address1 = address1 || address.address1;
    address.address2 = address2 !== undefined ? address2 : address.address2;
    address.city = city || address.city;
    address.state = state || address.state;
    address.country = country || address.country;
    address.zip = zip || address.zip;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await address.save();

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      address,
    });
  } catch (err) {
    console.error("Update address error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Delete address
export const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const address = await UserAddress.findOneAndDelete({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // If deleted address was default, make another address default
    if (address.isDefault) {
      const nextAddress = await UserAddress.findOne({ user: userId });
      if (nextAddress) {
        nextAddress.isDefault = true;
        await nextAddress.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Address deleted successfully",
    });
  } catch (err) {
    console.error("Delete address error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Set default address
export const setDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId } = req.params;

    const address = await UserAddress.findOne({ _id: addressId, user: userId });
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // Remove default from all other addresses
    await UserAddress.updateMany({ user: userId }, { isDefault: false });

    // Set this address as default
    address.isDefault = true;
    await address.save();

    res.status(200).json({
      success: true,
      message: "Default address updated",
      address,
    });
  } catch (err) {
    console.error("Set default address error:", err);
    res.status(500).json({ message: err.message });
  }
};

// Get default address
export const getDefaultAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const address = await UserAddress.findOne({ user: userId, isDefault: true });

    if (!address) {
      return res.status(404).json({ message: "No default address found" });
    }

    res.status(200).json({
      success: true,
      address,
    });
  } catch (err) {
    console.error("Get default address error:", err);
    res.status(500).json({ message: err.message });
  }
};
