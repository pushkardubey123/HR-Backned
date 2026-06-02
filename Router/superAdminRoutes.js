// Router/superAdminRoutes.js
const express = require("express");
const router = express.Router();
const superAdminAuth = require("../Middleware/superAdminAuth");
const { 
    createPlan, 
    getAllPlans, 
    getAllClients, 
    toggleClientStatus, 
    superAdminLogin,
    assignPlanToClient,
    getExpiredTrials,
    removeTrialAccess,
    getAllEnquiries,
    createEnquiry,
    updateEnquiryStatus,
    deleteEnquiry,
    getAllTrials,
    deletePlan,
    updatePlan,
    getGlobalSettings,
    updateGlobalSettings
} = require("../Controllers/superAdminController");

router.post("/login", superAdminLogin);
router.get("/plans", superAdminAuth, getAllPlans);
router.post("/plans/create", superAdminAuth, createPlan);
router.put("/plans/:id", superAdminAuth, updatePlan);
router.delete("/plans/:id", superAdminAuth, deletePlan);
router.get("/clients", superAdminAuth, getAllClients);
router.put("/clients/toggle-status", superAdminAuth, toggleClientStatus);
router.put("/clients/assign-plan", superAdminAuth, assignPlanToClient);
router.get("/trials/all", superAdminAuth, getAllTrials);
router.post("/trials/remove", superAdminAuth, removeTrialAccess);
router.get("/enquiries", superAdminAuth, getAllEnquiries);

// CREATE (Ye public route hona chahiye, bina token ke kaam karega taaki koi bhi form bhar sake)
router.post("/public/enquiries", createEnquiry);
router.get("/public/plans", getAllPlans);

// UPDATE & DELETE (Ye protected hain, sirf Super Admin use karega)
router.put("/enquiries/:id/status", superAdminAuth, updateEnquiryStatus);
router.delete("/enquiries/:id", superAdminAuth, deleteEnquiry);

router.get("/settings", superAdminAuth, getGlobalSettings);
router.put("/settings", superAdminAuth, updateGlobalSettings);

module.exports = router;