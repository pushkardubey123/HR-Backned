const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); 
const checkSubscription = require("../Middleware/checkSubscription"); // ✅ Added
const projectController = require("../Controllers/projectController");

// 🔴 PROJECT MANAGEMENT
router.post("/projects", verifyToken, attachCompanyId, checkSubscription, checkPermission("project", "create"), projectController.createProject);
router.get("/", verifyToken, attachCompanyId, checkSubscription, checkPermission("project", "view"), projectController.getAllProjects);
router.get("/:id", verifyToken, attachCompanyId, checkSubscription, checkPermission("project", "view"), projectController.getProjectById);
router.put("/:id", verifyToken, attachCompanyId, checkSubscription, checkPermission("project", "edit"), projectController.updateProject);
router.delete("/:id", verifyToken, attachCompanyId, checkSubscription, checkPermission("project", "delete"), projectController.deleteProject);

// Task Management
router.post("/:id/tasks", verifyToken, attachCompanyId, checkSubscription, checkPermission("project", "edit"), projectController.addTaskToProject);
router.delete("/:projectId/tasks/:taskId", verifyToken, attachCompanyId, checkSubscription, checkPermission("project", "edit"), projectController.deleteTaskFromProject);

// 🟢 SELF SERVICE TASK ACTIONS
router.put("/:projectId/tasks/:taskId/status", verifyToken, attachCompanyId, checkSubscription, projectController.updateTaskStatus);
router.post("/:projectId/tasks/:taskId/comments", verifyToken, attachCompanyId, checkSubscription, projectController.addCommentToTask);
router.post("/:projectId/tasks/:taskId/timelogs", verifyToken, attachCompanyId, checkSubscription, projectController.addTimeLogToTask);

module.exports = router;