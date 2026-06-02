const mongoose = require("mongoose");

const TicketAuditSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Jisne action liya
  action: { type: String, required: true }, // e.g., 'CREATED', 'STATUS_CHANGED', 'ASSIGNED', 'COMMENTED'
  details: { type: String, required: true }, // Exact detail: "Status changed from Open to In-Progress"
}, { timestamps: true });

module.exports = mongoose.model("TicketAudit", TicketAuditSchema);