const express = require("express");
const {
  getAnalytics,
  getUsers,
  getListings,
  adminDeleteListing,
  getSwaps,
} = require("../controllers/adminController");

const adminMiddleware = require("../middleware/adminMiddleware");

const router = express.Router();

// All routes require admin role
router.use(adminMiddleware);

router.get("/analytics", getAnalytics);
router.get("/users", getUsers);
router.get("/listings", getListings);
router.delete("/listings/:id", adminDeleteListing);
router.get("/swaps", getSwaps);

module.exports = router;
