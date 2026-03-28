// models/Plan.js (Mongoose Schema)
const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  
  // 🔥 NEW PREMIUM FIELDS START HERE 🔥
  originalPrice: { type: Number, default: 0 }, 
  targetAudience: { type: String, default: "" }, 
  badgeText: { type: String, default: "" }, 
  buttonText: { type: String, default: "Subscribe Now" },
  themeColor1: { type: String, default: "#4f46e5" }, 
  themeColor2: { type: String, default: "#7c3aed" }, 
  // 🔥 NEW PREMIUM FIELDS END HERE 🔥

  durationDays: { type: Number, required: true },
  isTrial: { type: Boolean, default: false },
  description: { type: String },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  
  limits: {
    maxEmployees: { type: Number, default: 0 },
    maxStorageMB: { type: Number, default: 0 },
    maxBranches: { type: Number, default: 0 }
  },
  allowedModules: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.model('Plan', planSchema);