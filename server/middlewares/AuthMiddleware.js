const jwt = require("jsonwebtoken");
const { Users } = require("../models");

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers["x-auth-token"] || req.headers.authorization;

  if (!authHeader) {
    return res.status(403).json({
      status: false,
      message: "Access denied. You must be authenticated. ",
    });
  }


  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7, authHeader.length)
    : authHeader;

  try {
    const decoded = jwt.verify(token, "sangkiplaimportantkey4005");

    const user = await Users.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    req.user = {
      id: user.id,
      userType: user.userType,
      email: user.email,
      name: user.name,
      phoneNumber: user.phoneNumber,
      isApproved: user.isApproved
    };
    next();
  } catch (error) {
    let message = "Invalid token";

    if (error instanceof jwt.TokenExpiredError) {
      message = "Token expired";
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = "Malformed token";
    }

    res
      .status(500)
      .json({ status: false, message: `${message}. Please log in again.` });
  }
};

const verifyTokenAndAuthorization = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      await verifyToken(req, res, () => {}); // First verify token

      if (!req.user) {
        return res.status(403).json({
          success: false,
          message: "Access denied. No user provided.",
        });
      }

      if (allowedRoles.length === 0) {
        return next();
      }

      if (!allowedRoles.includes(req.user.userType)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient privileges.",
          requiredRoles: allowedRoles,
          yourRole: req.user.userType,
        });
      }

      next();
    } catch (error) {
      console.error("Authorization error:", error);
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };
};

const roleCheck = (requiredRole) => {
  return verifyTokenAndAuthorization([requiredRole]);
};

const isAdmin = roleCheck("admin");
const isCustomer = roleCheck("customer");
const isDriver = roleCheck("driver");
const isSupplier = roleCheck("supplier");
const isInventoryManager = roleCheck("inventory_manager");
const isFinanceManager = roleCheck("finance_manager");
const isTechnicianManager = roleCheck("technician_manager");
const isServiceManager = roleCheck("service_manager");
const isDispatchManager = roleCheck("dispatch_manager");

module.exports = {
  verifyToken,
  verifyTokenAndAuthorization,
  isAdmin,
  isCustomer,
  isDriver,
  isSupplier,
  isDispatchManager,
  isTechnicianManager,
  isFinanceManager,
  isInventoryManager,
  isServiceManager
};
