// Controllers/permissionController.js
const Permission = require("../Modals/Permission");
const allModules = require("../utils/modules"); 

exports.getMyModules = async (req, res) => {
  try {
    // 1. If Admin: Give all modules and full permissions
    if (req.user.role === "admin") {
      const adminDetailed = {};
      allModules.forEach(mod => {
        adminDetailed[mod] = { view: true, create: true, edit: true, delete: true };
      });
      return res.json({ modules: allModules, detailed: adminDetailed }); 
    }

    // 2. If Employee: Fetch their specific permissions
    const permissions = await Permission.find({
      companyId: req.companyId,
      employeeId: req.user._id 
    });

    const modules = [];
    const detailed = {};

    permissions.forEach(p => {
      if (p.permissions.view) modules.push(p.module);
      detailed[p.module] = p.permissions; // Detailed mapping
    });

    res.json({ modules, detailed });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};