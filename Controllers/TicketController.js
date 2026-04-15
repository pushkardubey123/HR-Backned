const Ticket = require("../Modals/Ticket/Ticket");
const TicketCategory = require("../Modals/Ticket/TicketCategory");
const TicketComment = require("../Modals/Ticket/TicketComment");
const User = require("../Modals/User");
const Permission = require("../Modals/Permission");
const TicketAuditSchema = require("../Modals/Ticket/TicketAuditSchema");
const mongoose = require("mongoose");

const calculateSLA = (priority) => {
  const hours = { 'Urgent': 4, 'High': 24, 'Medium': 48, 'Low': 72 };
  const addHours = hours[priority] || 48;
  return new Date(Date.now() + addHours * 60 * 60 * 1000);
};

exports.createTicket = async (req, res) => {
  try {
    const { title, description, branchId, departmentId, priority, attachments, assigneeId } = req.body;
    
    // 🔥 ADMIN ke liye UI se aayi hui branchId, Employee ke liye req.branchId
    const finalBranchId = req.user.role === "admin" ? branchId : req.branchId;

    if (!title || !description || !departmentId || !finalBranchId) {
      return res.status(400).json({ success: false, message: "Title, Description, Branch, and Department are required." });
    }

    const companyId = req.companyId;
    const requesterId = req.user._id || req.user.id;
    let slaHours = calculateSLA(priority);

    // 🔥 FIX: Agar UI se assigneeId aaya hai toh wo save hoga, warna null jayega (Queue banega)
    const finalAssigneeId = (assigneeId === "" || !assigneeId) ? null : assigneeId;

    const newTicket = await Ticket.create({
      companyId, branchId: finalBranchId, departmentId, title, description,
      requesterId, assigneeId: finalAssigneeId, status: 'Open', priority,
      slaDeadline: slaHours, attachments
    });

    res.status(201).json({ success: true, message: "Ticket Created Successfully", data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};

exports.getManageTickets = async (req, res) => {
  try {
    const companyId = req.companyId;
    let filter = { companyId };

    const currentUser = await User.findById(req.user._id || req.user.id);
    const hasAuthority = await Permission.findOne({ employeeId: currentUser._id, module: "helpdesk" });

    if (currentUser.role === "admin") {
      if (req.query.branchId) filter.branchId = req.query.branchId;
    } 
    else if (hasAuthority && hasAuthority.permissions.view) {
      filter.branchId = req.branchId; // Authority hai toh poori branch dekhega
    } 
    else {
      filter.branchId = req.branchId;
      if (currentUser.departmentId) {
         // 🔥 THE MAGIC LOGIC: Sirf meri assigned tickets YA mere department ki unassigned (queue) tickets
         filter.$or = [
           { assigneeId: currentUser._id },
           { departmentId: currentUser.departmentId, assigneeId: null } 
         ];
      } else {
         filter.assigneeId = currentUser._id;
      }
    }

    if (req.query.status && req.query.status !== 'Any') filter.status = req.query.status;
    if (req.query.priority && req.query.priority !== 'Any') filter.priority = req.query.priority;
    if (req.query.assigneeId && req.query.assigneeId !== 'Any') {
        filter.assigneeId = req.query.assigneeId === 'Unassigned' ? null : req.query.assigneeId;
    }

    const tickets = await Ticket.find(filter)
      .populate("departmentId", "name")
      .populate("requesterId", "name email")
      .populate("assigneeId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find({ companyId: req.companyId, requesterId: req.user._id || req.user.id })
      .populate("departmentId", "name").populate("assigneeId", "name email").sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🔥 UPDATE TICKET FUNCTION 🔥
exports.updateTicket = async (req, res) => {
  try {
    const { status, priority, assigneeId, slaDeadline } = req.body;
    const safeAssigneeId = (assigneeId === "" || !assigneeId) ? null : assigneeId;
    
    const ticket = await Ticket.findOne({ _id: req.params.ticketId, companyId: req.companyId });
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    // 🔒 CLOSED TICKET LOCK: Agar ticket closed hai aur user admin nahi hai, toh Block kardo!
    if (ticket.status === 'Closed' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "This ticket is Closed. Only an Admin can reopen or modify it." });
    }

    let finalAssigneeId = safeAssigneeId;

    // Security for Re-assignment
    if (req.user.role !== 'admin') {
      const auth = await Permission.findOne({ employeeId: req.user._id || req.user.id, module: "helpdesk" });
      if (!auth) {
         const currentUserId = (req.user._id || req.user.id).toString();
         if (safeAssigneeId !== ticket.assigneeId?.toString()) {
            if (ticket.assigneeId === null && safeAssigneeId === currentUserId) {
               finalAssigneeId = currentUserId; 
            } else {
               finalAssigneeId = ticket.assigneeId; 
            }
         }
      }
    }

    const updated = await Ticket.findOneAndUpdate(
      { _id: req.params.ticketId, companyId: req.companyId },
      { 
        status, 
        priority, 
        assigneeId: finalAssigneeId,
        slaDeadline: slaDeadline ? new Date(slaDeadline) : ticket.slaDeadline // 🔥 Admin/Agent can now update resolution time
      },
      { new: true }
    );
    res.status(200).json({ success: true, message: "Ticket Updated", data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// 🔥 ADD COMMENT FUNCTION 🔥
exports.addTicketComment = async (req, res) => {
  try {
    const { message, isInternalNote } = req.body;
    const ticket = await Ticket.findOne({ _id: req.params.ticketId, companyId: req.companyId });
    if (!ticket) return res.status(404).json({ success: false, message: "Ticket not found" });

    // 🔒 CLOSED TICKET LOCK: No chatting on closed tickets unless you are admin
    if (ticket.status === 'Closed' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: "This ticket is Closed. Chat is disabled." });
    }

    let internal = false;
    if (req.user.role === 'admin') internal = isInternalNote;
    else {
      const auth = await Permission.findOne({ employeeId: req.user._id || req.user.id, module: "helpdesk" });
      if (auth) internal = isInternalNote;
    }

    const comment = await TicketComment.create({
      companyId: req.companyId, ticketId: ticket._id, senderId: req.user._id || req.user.id,
      message, isInternalNote: internal
    });

    if (ticket.requesterId.toString() === (req.user._id || req.user.id).toString() && ticket.status === 'Waiting on Employee') {
      ticket.status = 'In-Progress'; await ticket.save();
    }
    res.status(201).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

exports.getTicketComments = async (req, res) => {
  try {
    let commentFilter = { ticketId: req.params.ticketId, companyId: req.companyId };
    if (req.user.role !== 'admin') {
       const isAgent = await Permission.findOne({ employeeId: req.user._id || req.user.id, module: 'helpdesk' });
       if(!isAgent) commentFilter.isInternalNote = false; 
    }
    const comments = await TicketComment.find(commentFilter).populate("senderId", "name role profilePic").sort({ createdAt: 1 }); 
    res.status(200).json({ success: true, data: comments });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching conversation" });
  }
};

exports.getDashboardMetrics = async (req, res) => {
  try {
    const companyId = req.companyId;
    let matchFilter = { companyId: companyId };

    if (req.user.role !== "admin") {
      matchFilter.branchId = req.branchId;
    }

    const dashboardData = await Ticket.aggregate([
      { $match: matchFilter },
      {
        $facet: {
          "statusMetrics": [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          "priorityMetrics": [{ $group: { _id: "$priority", count: { $sum: 1 } } }],
          "slaBreaches": [{ $match: { isEscalated: true } }, { $count: "totalEscalated" }],
          "departmentMetrics": [
            { $group: { _id: "$departmentId", count: { $sum: 1 } } },
            { $lookup: { from: "departments", localField: "_id", foreignField: "_id", as: "deptData" } },
            { $unwind: "$deptData" },
            { $project: { _id: 0, departmentName: "$deptData.name", count: 1 } },
            { $sort: { count: -1 } } 
          ],
          "totalTickets": [{ $count: "count" }]
        }
      }
    ]);

    const metrics = dashboardData[0];
    const formattedResponse = {
      totalTickets: metrics.totalTickets[0]?.count || 0,
      totalEscalated: metrics.slaBreaches[0]?.totalEscalated || 0,
      statusDistribution: metrics.statusMetrics.reduce((acc, curr) => {
        acc[curr._id] = curr.count; return acc;
      }, { 'Open': 0, 'In-Progress': 0, 'Waiting on Employee': 0, 'Resolved': 0, 'Closed': 0 }),
      priorityDistribution: metrics.priorityMetrics.reduce((acc, curr) => {
        acc[curr._id] = curr.count; return acc;
      }, { 'Low': 0, 'Medium': 0, 'High': 0, 'Urgent': 0 }),
      departmentDistribution: metrics.departmentMetrics
    };

    res.status(200).json({ success: true, data: formattedResponse });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching dashboard metrics" });
  }
};

// ==========================================
// 8. EXTREME LEVEL REPORT (Admin Only)
// ==========================================
exports.getEmployeePerformanceReport = async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ success: false, message: "Unauthorized" });

    const companyId = new mongoose.Types.ObjectId(req.companyId);

    const report = await Ticket.aggregate([
      { $match: { companyId: companyId, assigneeId: { $ne: null } } },
      { 
        $group: {
          _id: "$assigneeId",
          totalAssigned: { $sum: 1 },
          resolvedCount: { 
            $sum: { $cond: [ { $or: [ { $eq: ["$status", "Resolved"] }, { $eq: ["$status", "Closed"] } ] }, 1, 0 ] } 
          },
          pendingCount: { 
            $sum: { $cond: [ { $and: [ { $ne: ["$status", "Resolved"] }, { $ne: ["$status", "Closed"] } ] }, 1, 0 ] } 
          },
          escalatedCount: { 
            $sum: { $cond: [{ $eq: ["$isEscalated", true] }, 1, 0] } 
          },
          // 🔥 NAYA METRIC: Kitni URGENT / HIGH priority tickets isne solve ki
          criticalSolved: {
            $sum: {
               $cond: [
                 { $and: [
                     { $or: [ { $eq: ["$status", "Resolved"] }, { $eq: ["$status", "Closed"] } ] },
                     { $or: [ { $eq: ["$priority", "Urgent"] }, { $eq: ["$priority", "High"] } ] }
                 ]},
                 1, 0
               ]
            }
          }
        }
      },
      { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "employeeData" } },
      { $unwind: "$employeeData" },
      { $lookup: { from: "departments", localField: "employeeData.departmentId", foreignField: "_id", as: "deptData" } },
      { $unwind: { path: "$deptData", preserveNullAndEmptyArrays: true } }
    ]);

    const formattedReport = report.map(r => {
        // Kitni percent tickets solve ki?
        const resRate = r.totalAssigned > 0 ? (r.resolvedCount / r.totalAssigned) * 100 : 0;
        
        // 🔥 NAYA METRIC: Kitni percent tickets Time Limits (SLA) ke andar solve hui?
        const slaSuccessRate = r.totalAssigned > 0 ? ((r.totalAssigned - r.escalatedCount) / r.totalAssigned) * 100 : 0;
        
        return {
            employeeId: r._id,
            name: r.employeeData?.name || "Unknown",
            email: r.employeeData?.email || "N/A",
            department: r.deptData?.name || "No Department",
            totalAssigned: r.totalAssigned,
            resolvedCount: r.resolvedCount,
            pendingCount: r.pendingCount,
            escalatedCount: r.escalatedCount,
            criticalSolved: r.criticalSolved, // Sent to Frontend
            slaSuccessRate: parseFloat(slaSuccessRate.toFixed(2)), // Sent to Frontend
            resolutionRate: parseFloat(resRate.toFixed(2)) 
        };
    });

    formattedReport.sort((a, b) => b.totalAssigned - a.totalAssigned);

    res.status(200).json({ success: true, data: formattedReport });
  } catch (error) {
    console.error("❌ Analytics Report Error:", error);
    res.status(500).json({ success: false, message: "Report generation failed" });
  }
};

// ==========================================
// 9. TICKET TIMELINE (Audit Trail)
// ==========================================
exports.getTicketTimeline = async (req, res) => {
  try {
    const timeline = await TicketAuditSchema.find({ ticketId: req.params.ticketId, companyId: req.companyId })
      .populate("performedBy", "name role")
      .sort({ createdAt: -1 }); // Newest actions first
      
    res.status(200).json({ success: true, data: timeline });
  } catch (error) {
    res.status(500).json({ success: false, message: "Timeline fetch failed" });
  }
};