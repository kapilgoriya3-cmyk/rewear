const express = require("express");

const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  getFavorites,
  toggleFavorite,
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/me", authMiddleware, getMe);
router.patch("/me", authMiddleware, updateProfile);
router.get("/favorites", authMiddleware, getFavorites);
router.post("/favorites/:itemId", authMiddleware, toggleFavorite);

module.exports = router;