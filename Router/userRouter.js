const express = require("express");
const router = express.Router();
const { 
  register, login, getAllUsers, getUserById, updateUser, deleteUser, 
  userForgetPassword, userVerifyPassword, userResetPassword, getPendingUsers, 
  approvePendingUser, rejectPendingUser, getAllEmployeeDates, googleLogin, 
  googleRegister, googleAuthCheck, getMyProfile, updateMyProfile, getMySubscription,
  getPublicCompanies // ✅ Ye function yahan zaroori hai
} = require("../Controllers/UserController");

const auth = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); 

// 1. PUBLIC ROUTES (No subscription check)
router.post("/user/register", register);
router.post("/user/login", login);
router.post("/user/google-login", googleLogin);
router.post("/user/google-auth-check", googleAuthCheck);
router.post("/user/google-register", googleRegister);
router.post("/user/forgot-password", userForgetPassword);
router.post("/user/verify-otp", userVerifyPassword);
router.post("/user/reset-password", userResetPassword);

// ✅ NEW PUBLIC ROUTE FOR COMPANY DROPDOWN
router.get("/public/companies", getPublicCompanies); 

// 2. SELF SERVICE ROUTES
router.get("/user/profile", auth, attachCompanyId, checkSubscription, getMyProfile); 
router.put("/user/profile", auth, attachCompanyId, checkSubscription, updateMyProfile);

// 3. STAFF MANAGEMENT 
router.get("/user", auth, attachCompanyId, checkSubscription, checkPermission("staff", "view"), getAllUsers);
router.get("/employeeget/:id", auth, attachCompanyId, checkSubscription, checkPermission("staff", "view"), getUserById);
router.put("/employeeget/:id", auth, attachCompanyId, checkSubscription, checkPermission("staff", "edit"), updateUser);
router.delete("/employeedelete/:id", auth, attachCompanyId, checkSubscription, checkPermission("staff", "delete"), deleteUser);

// 4. PENDING USERS
router.get("/user/pending-users", auth, attachCompanyId, checkSubscription, checkPermission("staff", "view"), getPendingUsers);
router.post("/user/approve-user/:id", auth, attachCompanyId, checkSubscription, checkPermission("staff", "add"), approvePendingUser);
router.delete("/pending/reject/:id", auth, attachCompanyId, checkSubscription, checkPermission("staff", "delete"), rejectPendingUser);

// 5. MISC
router.get("/user/employee-dates", auth, attachCompanyId, checkSubscription, checkPermission("bday", "view"), getAllEmployeeDates);
router.get("/user/my-subscription", auth, attachCompanyId, getMySubscription);

module.exports = router;