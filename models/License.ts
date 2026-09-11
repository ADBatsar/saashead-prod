import mongoose from "mongoose";

const LicenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    applicationName: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    vendorName: { type: String, required: true },
    
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // NEW: Unique Invoice / Contract ID enforcement
    invoiceId: { type: String, sparse: true, unique: true },

    category: { type: String, default: "Productivity" },
    department: { type: String, default: "Engineering" },
    owner: { type: String, default: "IT" },
    billingCycle: { type: String, default: "monthly" },
    
    licenseCount: { type: Number, default: 0 },
    costPerLicense: { type: Number, default: 0 },
    renewalDate: { type: Date },

    assignedUsers: { type: Number, default: 0 },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.models.License || mongoose.model("License", LicenseSchema);
