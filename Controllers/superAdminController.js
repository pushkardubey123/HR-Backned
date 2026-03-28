// Controllers/superAdminController.js
const Plan = require("../Modals/SuperAdmin/Plan");
const CompanySubscription = require("../Modals/SuperAdmin/CompanySubscription");
const User = require("../Modals/User");
// Controllers/superAdminController.js
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const MasterEnquiry = require("../Modals/SuperAdmin/MasterEnquiry");

exports.superAdminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "superadmin" });

    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid Super Admin credentials" });
    }

    // 2. Compare Password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, role: "superadmin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // Token valid for 1 day
    );

    res.json({
      success: true,
      token,
      data: { id: user._id, name: user.name, email: user.email, role: "superadmin" }
    });
  } catch (error) {
    console.error("Super Admin Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed due to server error" });
  }
};



/* ================= 2. GET ALL PLANS ================= */
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await Plan.find().sort({ createdAt: -1 });
    res.json({ success: true, data: plans });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getAllClients = async (req, res) => {
  try {
    const clients = await CompanySubscription.find()
      .populate("companyId", "name email phone status createdAt")
      // 🔥 FIX: 'limits' add kiya gaya hai taaki maxStorageMB frontend par ja sake
      .populate("planId", "name isTrial limits") 
      .sort({ createdAt: -1 });

    res.json({ success: true, data: clients });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch clients" });
  }
};

/* ================= 4. BLOCK / UNBLOCK A CLIENT ================= */
exports.toggleClientStatus = async (req, res) => {
  try {
    const { subscriptionId, action } = req.body; // action can be "block" or "active"

    if (!["active", "blocked"].includes(action)) {
      return res.status(400).json({ success: false, message: "Invalid action" });
    }

    const sub = await CompanySubscription.findByIdAndUpdate(
      subscriptionId,
      { status: action },
      { new: true }
    );

    if (!sub) return res.status(404).json({ success: false, message: "Subscription not found" });

    res.json({ success: true, message: `Client successfully ${action}ed!`, data: sub });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

/* ================= 5. ASSIGN NEW PLAN TO CLIENT ================= */
exports.assignPlanToClient = async (req, res) => {
  try {
    const { subscriptionId, newPlanId } = req.body;

    // 1. Naya Plan database me dhoondo
    const newPlan = await Plan.findById(newPlanId);
    if (!newPlan) {
      return res.status(404).json({ success: false, message: "Selected plan not found" });
    }

    // 2. Nayi Expiry Date calculate karo
    const newValidUpto = new Date();
    if (newPlan.durationDays === -1) {
      newValidUpto.setFullYear(newValidUpto.getFullYear() + 100); // Lifetime (100 years later)
    } else {
      newValidUpto.setDate(newValidUpto.getDate() + newPlan.durationDays);
    }

    // 3. Subscription Update karo
    const updatedSub = await CompanySubscription.findByIdAndUpdate(
      subscriptionId,
      {
        planId: newPlan._id,
        validUpto: newValidUpto,
        isTrial: newPlan.isTrial,
        status: "active" // Plan assign hote hi status active ho jayega
      },
      { new: true }
    ).populate("planId", "name isTrial");

    res.json({ 
      success: true, 
      message: `Plan successfully upgraded to ${newPlan.name}!`, 
      data: updatedSub 
    });

  } catch (error) {
    console.error("Assign Plan Error:", error);
    res.status(500).json({ success: false, message: "Failed to assign plan" });
  }
};

exports.getAllTrials = async (req, res) => {
  try {
    const subscriptions = await CompanySubscription.find()
      .populate("companyId", "name email")
      // 🔥 FIX: Yahan bhi 'limits' add kar diya hai safety ke liye
      .populate("planId", "name isTrial limits") 
      .sort({ createdAt: -1 });

    const trials = subscriptions.filter(sub => sub.planId && sub.planId.isTrial === true);

    res.json({ success: true, data: trials });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch trials" });
  }
};
/* ================= 7. REMOVE TRIAL ACCESS ================= */
exports.removeTrialAccess = async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    
    // Subscription ko delete kar do ya block kar do
    // Yahan hum safely subscription delete kar rahe hain jisse unka access hamesha ke liye chala jaye
    await CompanySubscription.findByIdAndDelete(subscriptionId);

    res.json({ success: true, message: "Trial access removed successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to remove access" });
  }
};



/* ================= 8. GET ALL ENQUIRIES ================= */
exports.getAllEnquiries = async (req, res) => {
  try {
    // Sabse nayi enquiry sabse upar aayegi (sort by createdAt -1)
    const enquiries = await MasterEnquiry.find().sort({ createdAt: -1 });
    res.json({ success: true, data: enquiries });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to fetch enquiries" });
  }
};

exports.createEnquiry = async (req, res) => {
  try {
    const { name, mobileNo, email, message } = req.body;
    const newEnquiry = await MasterEnquiry.create({ name, mobileNo, email, message });
    res.status(201).json({ success: true, message: "Enquiry submitted successfully!", data: newEnquiry });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to submit enquiry" });
  }
};

/* ================= UPDATE ENQUIRY STATUS (Super Admin) ================= */
exports.updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // e.g., "Pending" or "Contacted"
    
    const updated = await MasterEnquiry.findByIdAndUpdate(id, { status }, { new: true });
    res.json({ success: true, message: "Status updated successfully", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update status" });
  }
};

/* ================= DELETE ENQUIRY (Super Admin) ================= */
exports.deleteEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    await MasterEnquiry.findByIdAndDelete(id);
    res.json({ success: true, message: "Enquiry deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete enquiry" });
  }
};

/* ================= DELETE PLAN ================= */
/* ================= 9. DELETE PLAN (Super Admin) ================= */
exports.deletePlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if the plan is currently assigned to any active company
    const isInUse = await CompanySubscription.findOne({ planId: id });
    if (isInUse) {
      return res.status(400).json({ 
        success: false, 
        message: "Cannot delete this plan because it is actively used by one or more clients." 
      });
    }

    await Plan.findByIdAndDelete(id);
    res.json({ success: true, message: "Plan deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete plan" });
  }
};

/* ================= 10. UPDATE PLAN (Super Admin) ================= */
/* ================= 1. CREATE A NEW PLAN ================= */
exports.createPlan = async (req, res) => {
  try {
    // 🔥 Naye fields yahan add kiye hain destructuring mein
    const { name, price, originalPrice, targetAudience, badgeText, buttonText, themeColor1, themeColor2, durationDays, isTrial, allowedModules, limits, description } = req.body;

    const newPlan = new Plan({
      name, 
      price,
      originalPrice, // 🔥 NEW
      targetAudience, // 🔥 NEW
      badgeText, // 🔥 NEW
      buttonText, // 🔥 NEW
      themeColor1, // 🔥 NEW
      themeColor2, // 🔥 NEW
      durationDays,
      isTrial,
      allowedModules,
      limits,
      description
    });

    await newPlan.save();
    res.status(201).json({ success: true, message: "Plan created successfully!", data: newPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to create plan", error: error.message });
  }
};

/* ================= 10. UPDATE PLAN (Super Admin) ================= */
exports.updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, originalPrice, targetAudience, badgeText, buttonText, themeColor1, themeColor2, durationDays, isTrial, allowedModules, limits, description } = req.body;

    const updatedPlan = await Plan.findByIdAndUpdate(
      id,
      { name, price, originalPrice, targetAudience, badgeText, buttonText, themeColor1, themeColor2, durationDays, isTrial, allowedModules, limits, description }, // 🔥 NEW
      { new: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ success: false, message: "Plan not found" });
    }

    res.json({ success: true, message: "Plan updated successfully!", data: updatedPlan });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to update plan" });
  }
};