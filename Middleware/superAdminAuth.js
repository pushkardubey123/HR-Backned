// Middleware/superAdminAuth.js
const jwt = require("jsonwebtoken");
const User = require("../Modals/User");

const superAdminAuth = async (req, res, next) => {
  try {
    const rawHeader = req.header("Authorization");
    const token = rawHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("role");

    if (!user || user.role !== "superadmin") {
      return res.status(403).json({ success: false, message: "Access Denied: Super Admin only!" });
    }

    req.user = decoded; // Token payload ko request me daal diya
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or Expired Token" });
  }
};

module.exports = superAdminAuth;