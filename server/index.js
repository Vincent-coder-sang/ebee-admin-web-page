/** @format */

const cookieParser = require("cookie-parser");
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");

dotenv.config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const userRoutes = require("./routes/userRoutes");
const cartRoutes = require("./routes/cartRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const userAddressRoutes = require("./routes/userAddressRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");

// Newly added
const bookingRoutes = require("./routes/bookingRoutes");
const rentalRoutes = require("./routes/rentalRoutes");
const dispatchRoutes = require("./routes/dispatchRoutes");
const reportRoutes = require("./routes/reportRoutes");
const fineRoutes = require("./routes/fineRoutes");
// const helpRoutes = require("./routes/helpRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
// const contactRoutes = require("./routes/contactRoutes");

const app = express();
const port = 3001;

app.use(
  cors({ origin: "https://ebee-admin-kjn8.onrender.com", credentials: true })
);

app.use(express.json()); // For parsing JSON bodies

app.use(cookieParser());

const db = require("./models");
// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/inventories", inventoryRoutes);
app.use("/api/address", userAddressRoutes);
app.use("/api/feedbacks", feedbackRoutes);

app.use("/api/bookings", bookingRoutes);
app.use("/api/rentals", rentalRoutes);
app.use("/api/dispatches", dispatchRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/fines", fineRoutes);
// app.use("/api/helps", helpRoutes);
app.use("/api/services", serviceRoutes);
// app.use("/api/contacts", contactRoutes);

app.get("/test", (req, res) => {
  res.status(200).send("Backend is working");
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "dist", "index.html"));
  });
}

db.sequelize.sync().then(() => {
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
