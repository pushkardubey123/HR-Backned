const AssetAssignment = require("../Modals/Asset/AssetAssignment");
const ExitRequest = require("../Modals/ExitRequest");

/* =========================
   EMPLOYEE → CREATE
========================= */
const createExitRequest = async (req, res) => {
  try {
    const { reason, resignationDate } = req.body;

    const exit = await ExitRequest.create({
      companyId: req.companyId,
      branchId: req.user.branchId || null, // ✅ req.user.branchId use kiya gaya hai
      employeeId: req.user._id,
      reason,
      resignationDate,
    });

    res.json({
      success: true,
      message: "Exit request submitted",
      data: exit,
    });
  } catch (err) {
    console.error("Exit submit error:", err);
    res.status(500).json({ success: false });
  }
};

/* =========================
   EMPLOYEE → MY REQUESTS
========================= */
const getExitRequestsByEmployee = async (req, res) => {
  try {
    const data = await ExitRequest.find({
      companyId: req.companyId,
      employeeId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch {
    res.status(500).json({ success: false });
  }
};

/* =========================
   AUTHORIZED HR/ADMIN → ALL REQUESTS
========================= */
const getAllExitRequests = async (req, res) => {
  try {
    // ❌ YAHAN SE HARDCODED ADMIN CHECK HATA DIYA GAYA HAI ❌

    const filter = {
      companyId: req.companyId,
    };

    // 🔒 Branch-based Data Isolation: 
    // Agar normal employee (HR) hai, toh sirf uski branch ka data dikhao
    if (req.user.role !== "admin") {
      filter.branchId = req.user.branchId;
    } 

    const data = await ExitRequest.find(filter)
      .populate("employeeId", "name email profilePic")
      .sort({ createdAt: -1 });

    res.json({ success: true, data });
  } catch (err) {
    console.error("Exit admin fetch error:", err);
    res.status(500).json({ success: false });
  }
};

/* =========================
   AUTHORIZED HR/ADMIN → UPDATE
========================= */
/* =========================
   AUTHORIZED HR/ADMIN → UPDATE (WITH F&F CHECK)
========================= */
const updateExitRequestByAdmin = async (req, res) => {
  try {
    const { clearanceStatus, interviewFeedback, finalSettlement } = req.body;

    // 🔥 F&F ASSET CLEARANCE CHECK 🔥
    // Agar status "cleared" karne ki koshish ho rahi hai
    if (clearanceStatus === "cleared") {
      const exitDoc = await ExitRequest.findOne({
        _id: req.params.id,
        companyId: req.companyId,
      });

      if (exitDoc) {
        // Check karo kya is employee ke paas koi 'Assigned' asset hai?
        const pendingAssetsCount = await AssetAssignment.countDocuments({
          employeeId: exitDoc.employeeId,
          status: "Assigned" 
        });

        if (pendingAssetsCount > 0) {
          return res.status(400).json({ 
            success: false, 
            message: `Clearance Failed! Employee has ${pendingAssetsCount} pending company asset(s) to return.` 
          });
        }
      }
    }

    // Agar check pass ho gaya (ya status 'cleared' nahi hai), toh update hone do
    const updated = await ExitRequest.findOneAndUpdate(
      {
        _id: req.params.id,
        companyId: req.companyId,
      },
      {
        interviewFeedback: interviewFeedback,
        clearanceStatus: clearanceStatus,
        finalSettlement: finalSettlement,
      },
      { new: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error("Exit update error:", err);
    res.status(500).json({ success: false });
  }
};

/* =========================
   DELETE (PENDING ONLY)
========================= */
const deleteExitRequest = async (req, res) => {
  try {
    const reqDoc = await ExitRequest.findOne({
      _id: req.params.id,
      companyId: req.companyId,
    });

    if (!reqDoc || reqDoc.clearanceStatus !== "pending") {
      return res.status(400).json({ success: false });
    }

    await reqDoc.deleteOne();
    res.json({ success: true });
  } catch {
    res.status(500).json({ success: false });
  }
};

module.exports = {
  createExitRequest,
  getAllExitRequests,
  getExitRequestsByEmployee,
  updateExitRequestByAdmin,
  deleteExitRequest,
};