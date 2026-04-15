const mongoose = require("mongoose");

const TicketCommentSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  isInternalNote: { type: Boolean, default: false }, // Extreme level feature: HR apne me baat kar payega
  attachments: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model("TicketComment", TicketCommentSchema);