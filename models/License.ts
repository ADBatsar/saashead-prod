import mongoose from "mongoose";

const LicenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    applicationName: { type: String, required: true },
    //vendor: { type: String, required: true },
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
vendorName: { type: String, required: true },
    // Predefined Fields
    category: { type: String, default: "Productivity" },
    department: { type: String, default: "Engineering" },
    owner: { type: String, default: "IT" },
    billingCycle: { type: String, default: "monthly" }, // "monthly" or "yearly"
    
    // License Details
    licenseCount: { type: Number, default: 0 },
    costPerLicense: { type: Number, default: 0 },
    renewalDate: { type: Date },

    // The new RBAC User Assignment!
    assignedUsers: { type: Number, default: 0 }, // Keeping this as a fallback counter
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }] // The actual linked users
  },
  { timestamps: true }
);

export default mongoose.models.License || mongoose.model("License", LicenseSchema);
