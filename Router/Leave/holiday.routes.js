const express = require("express");
const router = express.Router();
const auth = require("../../Middleware/auth"); 
const companyMiddleware = require("../../Middleware/companyMiddleware");
const checkPermission = require("../../Middleware/checkPermission"); 

const { 
    getHolidays, 
    addHoliday, 
    updateHoliday, 
    deleteHoliday, 
    updateSettings 
} = require("../../Controllers/Leave/HolidayController");

router.get("/", auth, companyMiddleware, getHolidays); 

// CHANGED "leave" to "holidays"
router.put("/settings", auth, companyMiddleware, checkPermission("holidays", "edit"), updateSettings);
router.post("/", auth, companyMiddleware, checkPermission("holidays", "create"), addHoliday);
router.put("/:id", auth, companyMiddleware, checkPermission("holidays", "edit"), updateHoliday);
router.delete("/:id", auth, companyMiddleware, checkPermission("holidays", "delete"), deleteHoliday);

module.exports = router;