const Event = require("../Modals/Event");
const User = require("../Modals/User");

exports.createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate, color, departmentId, employeeId, branchId } = req.body;

    if (!branchId) {
      return res.status(400).json({ success: false, message: "Branch is required" });
    }

    const newEvent = new Event({
      companyId: req.companyId,
      branchId, 
      title,
      description,
      startDate,
      endDate,
      color,
      departmentId,
      employeeId,
      createdBy: req.user._id,
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({ success: true, message: "Event created successfully", event: savedEvent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


exports.getAllEvents = async (req, res) => {
  try {
    const filter = {
      companyId: req.companyId,
    };

    // ✅ FIXED: Using req.user.branchId for data isolation instead of failing
    if (req.user.role !== "admin") {
      filter.branchId = req.user.branchId; 
    }

    const events = await Event.find(filter)
      .populate("createdBy", "name email")
      .populate("departmentId", "name")
      .populate("employeeId", "name email");

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    // ✅ No hardcoded admin check needed; checkPermission middleware handles auth
    const updated = await Event.findByIdAndUpdate(
      req.params.id, 
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteEvent = async (req, res) => {
  try {
    // ✅ No hardcoded admin check needed
    const deleted = await Event.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.gelOneEvent = async (req, res) => {
  try {
    const userId = req.params.id;

    // Isme branch isolation lagaya hua hai, ye pehle se sahi hai
    const employee = await User.findOne({
      _id: userId,
      companyId: req.companyId,
      branchId: req.user.branchId, // Ensure req.user.branchId is used here
    });

    if (!employee) {
      return res.status(404).json({ success: false, message: "Employee not found" });
    }

    const departmentIds = Array.isArray(employee.department) ? employee.department : [employee.department];

    const events = await Event.find({
      companyId: req.companyId,
      $or: [
        { employeeId: userId },
        { departmentId: { $in: departmentIds } },
        { departmentId: { $exists: false } }, 
        { departmentId: null } 
      ],
    })
      .populate("createdBy", "name")
      .populate("departmentId", "name");

    res.json({ success: true, data: events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};