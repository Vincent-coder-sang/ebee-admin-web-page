/** @format */

const { Feedbacks, Users, Products } = require("../models");

// 🔹 Create feedback
const createFeedback = async (req, res) => {
  const { rating, comment, userId, productId } = req.body;

  if (!rating || !userId || !productId) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields: rating, userId, productId",
    });
  }

  try {
    const feedback = await Feedbacks.create({
      rating,
      comment,
      userId,
      productId,
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error("Error creating feedback:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get all feedback
const getFeedback = async (req, res) => {
  try {
    const feedbackList = await Feedbacks.findAll({
      include: [
        { model: Users, as: "user", attributes: ["id", "name", "email"] },
        { model: Products, as: "product", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({ success: true, data: feedbackList });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Get feedback by ID
const getFeedbackById = async (req, res) => {
  const { id } = req.params;

  try {
    const feedback = await Feedbacks.findByPk(id, {
      include: [
        { model: Users, as: "user", attributes: ["id", "name"] },
        { model: Products, as: "product", attributes: ["id", "name"] },
      ],
    });

    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.status(200).json({ success: true, data: feedback });
  } catch (error) {
    console.error("Error fetching feedback by ID:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Update feedback
const updateFeedback = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    const feedback = await Feedbacks.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    await feedback.update({
      rating: rating || feedback.rating,
      comment: comment || feedback.comment,
    });

    res.status(200).json({ success: true, message: "Feedback updated", data: feedback });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 Delete feedback
const deleteFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    const feedback = await Feedbacks.findByPk(id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    await feedback.destroy();

    res.status(200).json({ success: true, message: "Feedback deleted" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFeedback,
  getFeedback,
  getFeedbackById,
  updateFeedback,
  deleteFeedback,
};
