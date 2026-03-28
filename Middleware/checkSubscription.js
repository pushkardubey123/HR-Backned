// Middleware/checkSubscription.js
const CompanySubscription = require("../Modals/SuperAdmin/CompanySubscription");
const Plan = require("../Modals/SuperAdmin/Plan");

const checkSubscription = async (req, res, next) => {
  try {
    if (!req.companyId) {
      return res.status(400).json({ success: false, message: "Company ID missing in request." });
    }

    // 1. Find the company's subscription and populate Plan
    const subscription = await CompanySubscription.findOne({ companyId: req.companyId }).populate("planId");

    if (!subscription) {
      return res.status(403).json({ 
        success: false, 
        isExpired: true, 
        message: "No active subscription found. Please choose a premium plan to continue." 
      });
    }

    // 2. Check if Super Admin blocked them manually
    if (subscription.status === "blocked") {
      return res.status(403).json({ 
        success: false, 
        message: "Your account has been suspended by the Master Admin. Please contact support." 
      });
    }

    // 3. Check if the Trial or Plan has Expired
    const currentDate = new Date();
    if (currentDate > new Date(subscription.validUpto)) {
      if (subscription.status === "active") {
        subscription.status = "expired";
        await subscription.save();
      }

      const expiryMessage = subscription.planId?.isTrial 
        ? "Your free trial has expired. Please upgrade to a premium plan to continue using the HRMS."
        : "Your subscription plan has expired. Please renew your plan.";

      return res.status(403).json({ success: false, isExpired: true, message: expiryMessage });
    }

    // ==============================================================
    // 🔥 SMART STORAGE LIMIT CHECKER 🔥
    // ==============================================================
    if (req.files && Object.keys(req.files).length > 0) {
      const maxStorageMB = subscription.planId?.limits?.maxStorageMB ?? 0;
      
      if (maxStorageMB !== -1) { // -1 means Unlimited
        let incomingBytes = 0;
        
        // Calculate total size of all incoming files
        for (let key in req.files) {
          let file = req.files[key];
          if (Array.isArray(file)) {
            file.forEach(f => incomingBytes += f.size);
          } else {
            incomingBytes += file.size;
          }
        }

        // Convert incoming bytes to MB
        const incomingMB = incomingBytes / (1024 * 1024);
        const currentUsedMB = subscription.usage?.storageUsedMB || 0;

        // Check if adding this file exceeds the limit
        if (currentUsedMB + incomingMB > maxStorageMB) {
          return res.status(403).json({
            success: false,
            message: `Storage Limit Exceeded! You have used ${currentUsedMB.toFixed(2)}MB out of ${maxStorageMB}MB. Please upgrade your plan.`
          });
        }
        
        // Pass the incoming size in MB to the next controller so it can be added to the DB
        req.incomingMB = incomingMB;
      }
    }
    // ==============================================================

    // 4. Attach allowed modules and limits to the request
    req.allowedModules = subscription.planId?.allowedModules || [];
    req.planLimits = subscription.planId?.limits || {};
    req.currentUsage = subscription.usage || {};

    next();

  } catch (error) {
    console.error("Subscription Check Error:", error);
    res.status(500).json({ success: false, message: "Error validating subscription status." });
  }
};

module.exports = checkSubscription;