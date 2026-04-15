const mongoose = require("mongoose");

const TicketSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  branchId: { type: mongoose.Schema.Types.ObjectId, ref: "Branch", required: true, index: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department", required: true },
  
  ticketId: { type: String, unique: true }, // e.g., TKT-1001
  title: { type: String, required: true },
  description: { type: String, required: true },
  
  requesterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Jisne raise ki
  assigneeId: { type: mongoose.Schema.Types.ObjectId, ref: "User"}, // Jisko assign hui (Admin or Agent)
  
  priority: { type: String, enum: ['Low', 'Medium', 'High', 'Urgent'], default: 'Medium' },
  status: { type: String, enum: ['Open', 'In-Progress', 'Waiting on Employee', 'Resolved', 'Closed'], default: 'Open' },
  
  attachments: [{ type: String }],
  slaDeadline: { type: Date },
  isEscalated: { type: Boolean, default: false }
}, { timestamps: true });

// Auto-Generate Ticket ID using Pre-Save hook
TicketSchema.pre('save', async function(next) {
  if (!this.ticketId) {
    const count = await mongoose.model('Ticket').countDocuments({ companyId: this.companyId });
    // Generated as: TKT-{random3}-{count} to avoid any conflicts
    this.ticketId = `TKT-${Math.random().toString(36).substring(2, 5).toUpperCase()}-${1000 + count + 1}`; 
  }
  next();
});

module.exports = mongoose.model("Ticket", TicketSchema);