const express = require("express");
const router = express.Router();
const verifyToken = require("../Middleware/auth");
const attachCompanyId = require("../Middleware/companyMiddleware");
const checkPermission = require("../Middleware/checkPermission"); // ✅ Added
const projectController = require("../Controllers/projectController");

// ==========================================
// 🔴 PROJECT MANAGEMENT (Requires 'project' permissions)
// ==========================================
router.post("/projects", verifyToken, attachCompanyId, checkPermission("project", "create"), projectController.createProject);
router.get("/", verifyToken, attachCompanyId, checkPermission("project", "view"), projectController.getAllProjects);
router.get("/:id", verifyToken, attachCompanyId, checkPermission("project", "view"), projectController.getProjectById);
router.put("/:id", verifyToken, attachCompanyId, checkPermission("project", "edit"), projectController.updateProject);
router.delete("/:id", verifyToken, attachCompanyId, checkPermission("project", "delete"), projectController.deleteProject);

// Task Management (Only Managers/Admins create/delete tasks)
router.post("/:id/tasks", verifyToken, attachCompanyId, checkPermission("project", "edit"), projectController.addTaskToProject);
router.delete(
  "/:projectId/tasks/:taskId",
  verifyToken, attachCompanyId, checkPermission("project", "edit"),
  projectController.deleteTaskFromProject
);

// ==========================================
// 🟢 SELF SERVICE TASK ACTIONS (Assigned employees can update their tasks)
// ==========================================
router.put(
  "/:projectId/tasks/:taskId/status",
  verifyToken, attachCompanyId,
  projectController.updateTaskStatus
);
router.post(
  "/:projectId/tasks/:taskId/comments",
  verifyToken, attachCompanyId,
  projectController.addCommentToTask
);
router.post(
  "/:projectId/tasks/:taskId/timelogs",
  verifyToken, attachCompanyId,
  projectController.addTimeLogToTask
);

module.exports = router;