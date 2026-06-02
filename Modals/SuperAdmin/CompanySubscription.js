const mongoose = require("mongoose");

const CompanySubscriptionSchema = new mongoose.Schema({
  companyId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true,
    unique: true // Ek company ka ek hi active data hoga
  },
  planId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Plan", 
    required: true 
  },
  
  status: { type: String, enum: ["active", "expired", "blocked"], default: "active" },
  startDate: { type: Date, default: Date.now },
  validUpto: { type: Date, required: true },
  
  // Live Usage Tracking (Kitna use ho gaya)
  usage: {
    totalEmployees: { type: Number, default: 0 },
    storageUsedMB: { type: Number, default: 0 } // Document upload size track karne ke liye
  }
}, { timestamps: true });

module.exports = mongoose.model("CompanySubscription", CompanySubscriptionSchema);