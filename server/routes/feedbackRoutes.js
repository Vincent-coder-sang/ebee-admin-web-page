// const necessary modules
const express= require("express");
const {
  deleteFeedback,
  updateFeedback,
  getFeedback,
  getFeedbackById,
  createFeedback
}= require("../controllers/feedbackController");  // Ensure to use the .js extension

const router = express.Router();

// Define routes
router.post("/create",createFeedback);
router.get("/get",getFeedback);
router.delete("/delete/:feedbackId",deleteFeedback);
router.put("/update/:feedbackId",updateFeedback);
router.get("/get/:feedbackId",getFeedbackById);


module.exports = router;
