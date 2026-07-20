import mongoose from "mongoose";

const SnapshotSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    
    // The specific month and year this snapshot represents (e.g., "July", 2026)
    month: { type: String, required: true },
    year: { type: Number, required: true },
    
    // The locked-in totals for the reports dashboard
    totalMonthlySpend: { type: Number, required: true },
    totalActiveLicenses: { type: Number, required: true },

    // The granular locked-in data for each application
    applications: [
      {
        licenseId: { type: mongoose.Schema.Types.ObjectId, ref: "License" },
        applicationName: { type: String },
        costPerLicense: { type: Number },
        assignedUsers: { type: Number },
        monthlyCost: { type: Number } // (costPerLicense * assignedUsers) locked in!
      }
    ]
  },
  { timestamps: true }
);

export default mongoose.models.Snapshot || mongoose.model("Snapshot", SnapshotSchema);
