
// import bcrypt from "bcryptjs";
// import jwt from "jsonwebtoken";
// import { userModel } from "../../model/user/userModel.js";

// export const registerUser = async (req, res) => {
//   try {
//     const { firstname, lastname, email, password } = req.body;

//     const existingUser = await userModel.findOne({ email });
//     if (existingUser) return res.status(400).json({ message: "Email already registered" });

//     const user = await userModel.create({ firstname, lastname, email, password });
//     res.status(201).json({ message: "User registered successfully", user });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// export const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const user = await userModel.findOne({ email });
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     const token = jwt.sign({ id: user._id }, "your_jwt_secret", { expiresIn: "1h" });

//     res.status(200).json({ message: "Login successful", token });
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };
import User from "../../model/user/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret"; // ⚠️ Move this to .env

// Register user
export const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const user = new User({ firstname, lastname, email, password });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, firstname: user.firstname, lastname: user.lastname, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// Get logged-in user
export const getMe = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUser = async(req,res) =>{
    try {
      const user = await User.find();
      res.json(user);
    } catch (error) {
      console.log(error)
    }
  }