const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, location } = req.body;

    // 1. Check required fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        message: "Name, email, password and confirm password are required",
      });
    }

    // 2. Check name
    if (name.trim().length < 2) {
      return res.status(400).json({
        message: "Name must be at least 2 characters long",
      });
    }

    // 3. Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    // 4. Check password length
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // 5. Check password strength
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one uppercase letter, one lowercase letter and one number",
      });
    }

    // 6. Check confirm password
    if (password !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    // 7. Check if user already exists
    const existingUser = await User.findOne({
      email: email.toLowerCase().trim(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 8. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 9. Create user
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      location: location?.trim() || "Earth",
    });

    // 10. Create JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 11. Send response
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role,
      },
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Check password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    // Create JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, location } = req.body;
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (name !== undefined) {
      if (typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({ message: "Name must be at least 2 characters long" });
      }
      user.name = name.trim();
    }

    if (location !== undefined) {
      user.location = location.trim() || "Earth";
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const favoriteIds = (user.favorites || []).map((id) => id.toString());

    // If query requests populated items
    if (req.query.populate === "true") {
      const Item = require("../models/item");
      const items = await Item.find({ _id: { $in: user.favorites || [] } }).populate("owner", "name location");
      return res.json({ favorites: favoriteIds, items });
    }

    return res.json({ favorites: favoriteIds });
  } catch (error) {
    console.error("getFavorites error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const toggleFavorite = async (req, res) => {
  try {
    const mongoose = require("mongoose");
    const itemId = req.params.itemId || req.params.id;

    if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
      return res.status(400).json({ message: "Invalid item ID" });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!Array.isArray(user.favorites)) {
      user.favorites = [];
    }

    const existingIdx = user.favorites.findIndex(
      (fav) => fav && fav.toString() === itemId.toString()
    );

    let isFavorited = false;
    if (existingIdx > -1) {
      user.favorites.splice(existingIdx, 1);
      isFavorited = false;
    } else {
      user.favorites.push(itemId);
      isFavorited = true;
    }

    await user.save();

    return res.json({
      message: isFavorited ? "Item saved to favorites" : "Item removed from favorites",
      isFavorited,
      favorites: user.favorites.map((f) => f.toString()),
    });
  } catch (error) {
    console.error("toggleFavorite error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getFavorites,
  toggleFavorite,
};