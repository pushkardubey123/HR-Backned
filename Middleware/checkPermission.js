const Permission = require("../Modals/Permission")

const checkPermission = (module, action) => {
  return async(req, res, next) => {
    try {
      if(req.user.role === "admin") {
        return next()
      }

      const permission = await Permission.findOne({
        companyId: req.companyId,
        employeeId: req.user._id, // CHANGED: check by employee's own ID
        module
      })

      if(!permission || !permission.permissions[action]) {
        return res.status(403).json({
          success: false,
          message: "Access Denied: You don't have permission for this action."
        })
      }

      next()
    } catch(err) {
      res.status(500).json({ success: false, message: "Permission Error" })
    }
  }
}

module.exports = checkPermission;