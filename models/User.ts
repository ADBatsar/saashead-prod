import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, unique: true, sparse: true }, // ADDED: Required for OTP Login!
  companyName: { type: String },
  companySize: { type: String },
  department: { type: String }, // Storing what they picked in the dropdown (IT, Finance, etc.)
  
  // STRICT RBAC IMPLEMENTATION
  role: {
    type: String,
    required: true,
    enum: [
      // Platform Roles (HeadSaaS Admins)
      "Platform Owner", 
      "Platform Lead", 
      "Platform Operations", 
      "Platform Manager", 
      "Platform Workspace Specialist",
      
      // Workspace Roles (Tenant Users)
      "Workspace Chief", 
      "Workspace Operator", 
      "Workspace Viewer", 
      "Workspace License Holder"
    ],
    default: "Workspace Chief"
  },
  
  // Platform admins might not have a workspaceId, but all Workspace users MUST.
  workspaceId: { type: mongoose.Schema.Types.ObjectId, index: true }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);
