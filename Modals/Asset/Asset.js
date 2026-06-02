const mongoose = require("mongoose");

const AssetSchema = new mongoose.Schema(
  {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", 
      required: true,
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branch",
      index: true,
    },
    assetName: { 
      type: String, 
      required: true, 
      trim: true 
    },
    assetType: {
      type: String,
      enum: ["Unique", "Bulk"], // Unique = Laptop/Mobile, Bulk = T-Shirt/ID Card
      default: "Unique",
    },
    quantity: { 
      type: Number, 
      default: 1 
    },
    category: {
      type: String,
      enum: ["Hardware", "Software", "Access", "Consumable", "Other"],
      required: true,
    },
    serialNumber: { 
      type: String, 
      trim: true 
    },
    purchaseDate: { type: Date },
    warrantyExpiry: { type: Date },
    cost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Available", "Assigned", "Under Maintenance", "Lost/Stolen", "Retired", "Out of Stock"],
      default: "Available",
    },
    description: { type: String },
  },
  { timestamps: true }
);

// Multiple bulk items bina serial number ke save hone dene ke liye
AssetSchema.index(
  { companyId: 1, serialNumber: 1 }, 
  { unique: true, partialFilterExpression: { serialNumber: { $type: "string" } } }
);

module.exports = mongoose.model("Asset", AssetSchema);