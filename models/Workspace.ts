import mongoose, { Schema, models, model } from "mongoose";

const WorkspaceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    workspaceCode: { type: String, required: true, unique: true, uppercase: true },
    domain: { type: String, required: true, lowercase: true },
    country: { type: String, required: true },
    adminEmail: { type: String, required: true, lowercase: true },
    plan: { type: String, default: "Trial" },
    status: { type: String, default: "Trial" },
    // Customization for premium features
    settings: {
      primaryColor: { type: String, default: "#EAB308" },
      logoUrl: String,
    },
  },
  { timestamps: true }
);

// We explicitly name the collection 'companies' to match your existing data
export default models.Workspace || model("Workspace", WorkspaceSchema, "companies");
