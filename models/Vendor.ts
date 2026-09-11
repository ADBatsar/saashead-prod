import mongoose from "mongoose";

const VendorSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    
    name: { type: String, required: true },
    website: { type: String },
    contactName: { type: String },
    contactEmail: { type: String },
    contactPhone: { type: String }, // <-- ADDED THIS LINE
    status: { type: String, enum: ["Active", "Under Review", "Terminated"], default: "Active" },
  },
  { timestamps: true }
);

// Ensure a workspace cannot have duplicate vendor names
VendorSchema.index({ workspaceId: 1, name: 1 }, { unique: true });

export default mongoose.models.Vendor || mongoose.model("Vendor", VendorSchema);
