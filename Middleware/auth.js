const jwt = require("jsonwebtoken");
const User = require("../Modals/User");

const authMiddleware = async (req, res, next) => {
  try {
    const rawHeader = req.header("Authorization");
    const token = rawHeader?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Token missing" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ FIX 1: "designationId" ko select() me add kiya gaya hai
    const user = await User.findById(decoded.id).select(
      "name email role companyId branchId designationId"
    );

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // ✅ FIX 2: req.user me designationId pass kiya gaya hai
    req.user = {
      _id: user._id,          
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
      branchId: user.branchId, 
      designationId: user.designationId // Iske bina Authority kaam nahi karegi!
    };

    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

module.exports = authMiddleware;