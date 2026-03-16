const express = require("express");
const router = express.Router();

const {
  register,
  login,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  userForgetPassword,
  userVerifyPassword,
  userResetPassword,
  getPendingUsers,
  approvePendingUser,
  rejectPendingUser,
  getAllEmployeeDates,
  googleLogin,
  googleRegister,
  googleAuthCheck,
  getMyProfile,
  updateMyProfile
} = require("../Controllers/UserController");

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Permission Middleware Imported
const userTbl = require("../Modals/User");

// ==============================================================
// 1. PUBLIC & AUTHENTICATION ROUTES (No permissions needed)
// ==============================================================
router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/google-login", googleLogin);
router.post("/user/google-auth-check", googleAuthCheck);
router.post("/user/google-register", googleRegister);

router.post("/user/forgot-password", userForgetPassword);
router.post("/user/verify-otp", userVerifyPassword);
router.post("/user/reset-password", userResetPassword);

router.get("/public/companies", async (req, res) => {
  try {
    const companies = await userTbl.find({ role: "admin" }).select("name");
    res.json({ success: true, data: companies });
  } catch {
    res.json({ success: false, message: "Failed to fetch companies" });
  }
});

// ==============================================================
// 2. SELF SERVICE ROUTES (Only Auth needed, no strict module permission)
// ==============================================================
// Har employee apna profile dekh aur update kar sakta hai
router.get("/user/profile", auth, getMyProfile); 
router.put("/user/profile", auth, updateMyProfile);


// ==============================================================
// 3. STAFF MANAGEMENT ROUTES (Requires "staff" authority)
// ==============================================================

// View all users
router.get("/user", auth, attachCompanyId, checkPermission("staff", "view"), getAllUsers);

// View single user
router.get("/employeeget/:id", auth, attachCompanyId, checkPermission("staff", "view"), getUserById);

// Update single user
router.put("/employeeget/:id", auth, attachCompanyId, checkPermission("staff", "edit"), updateUser);

// Delete single user
router.delete("/employeedelete/:id", auth, attachCompanyId, checkPermission("staff", "delete"), deleteUser);


// ==============================================================
// 4. PENDING USERS / APPROVALS (Requires "staff" authority)
// ==============================================================

// View pending users
router.get("/user/pending-users", auth, attachCompanyId, checkPermission("staff", "view"), getPendingUsers);

// Approve pending user (We map this to "add" or "edit" permission)
router.post("/user/approve-user/:id", auth, attachCompanyId, checkPermission("staff", "add"), approvePendingUser);

// Reject pending user
router.delete("/pending/reject/:id", auth, attachCompanyId, checkPermission("staff", "delete"), rejectPendingUser);


// ==============================================================
// 5. MISC EMPLOYEE DATA 
// ==============================================================
router.get("/user/employee-dates", auth, attachCompanyId, checkPermission("staff", "view"), getAllEmployeeDates);

module.exports = router;