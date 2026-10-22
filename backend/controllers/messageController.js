const Message = require("../models/message");
const SwapRequest = require("../models/swapRequest");

const sendMessage = async (req, res) => {
  try {
    const { receiver, swapRequest, text } = req.body;

    if (!receiver || !swapRequest || !text) {
      return res.status(400).json({
        message: "Please provide receiver, swap request and message",
      });
    }

    // Security: verify the sender is a participant in the swap
    const swap = await SwapRequest.findById(swapRequest);

    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    const userId = req.user.userId;

    if (
      swap.requester.toString() !== userId &&
      swap.receiver.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "You are not part of this swap" });
    }

    const message = await Message.create({
      sender: req.user.userId,
      receiver,
      swapRequest,
      text,
    });

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getMessages = async (req, res) => {
  try {
    // Security: verify the requester is a participant in the swap
    const swap = await SwapRequest.findById(req.params.swapRequestId);

    if (!swap) {
      return res.status(404).json({ message: "Swap request not found" });
    }

    const userId = req.user.userId;

    if (
      swap.requester.toString() !== userId &&
      swap.receiver.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "You are not part of this swap" });
    }

    const messages = await Message.find({
      swapRequest: req.params.swapRequestId,
    })
      .populate("sender", "name")
      .populate("receiver", "name")
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendMessage,
  getMessages,
};