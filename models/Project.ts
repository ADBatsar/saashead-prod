import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    workspaceId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },
    name: { type: String, required: true },
    description: { type: String, default: "" },
    status: { 
      type: String, 
      enum: ["Active", "Paused", "Completed"], 
      default: "Active" 
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    
    // RBAC: Array of Workspace Users assigned to this project
    assignedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

export default mongoose.models.Project || mongoose.model("Project", ProjectSchema);
