const User = require("../models/user");
const Item = require("../models/item");
const SwapRequest = require("../models/swapRequest");

// GET /api/admin/analytics — real DB counts
const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      totalListings,
      totalSwaps,
      acceptedSwaps,
      rejectedSwaps,
      activeListings,
    ] = await Promise.all([
      User.countDocuments(),
      Item.countDocuments(),
      SwapRequest.countDocuments(),
      SwapRequest.countDocuments({ status: "accepted" }),
      SwapRequest.countDocuments({ status: "rejected" }),
      Item.countDocuments({ availability: "available" }),
    ]);

    const swapConversionRate =
      totalSwaps > 0
        ? Math.round((acceptedSwaps / totalSwaps) * 100)
        : 0;

    res.json({
      totalUsers,
      totalListings,
      totalSwaps,
      acceptedSwaps,
      rejectedSwaps,
      activeListings,
      swapConversionRate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/users — list all users (no passwords)
const getUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/listings — list all listings
const getListings = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json({ items });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/admin/listings/:id — remove inappropriate listing (admin only)
const adminDeleteListing = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.deleteOne();

    res.json({ message: "Listing removed by admin" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/admin/swaps — list all swap requests
const getSwaps = async (req, res) => {
  try {
    const swaps = await SwapRequest.find()
      .populate("requester", "name email")
      .populate("receiver", "name email")
      .populate("requestedItem", "title category")
      .populate("offeredItem", "title category")
      .sort({ createdAt: -1 });

    res.json({ swaps });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAnalytics,
  getUsers,
  getListings,
  adminDeleteListing,
  getSwaps,
};
