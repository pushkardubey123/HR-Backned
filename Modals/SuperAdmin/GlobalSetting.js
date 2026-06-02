const mongoose = require("mongoose");

const GlobalSettingSchema = new mongoose.Schema({
  expiryAlertDays: { 
    type: Number, 
    default: 3 // Default 3 din pehle mail jayega
  }
}, { timestamps: true });

module.exports = mongoose.model("GlobalSetting", GlobalSettingSchema);