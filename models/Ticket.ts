import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  workspaceId: { type: String, required: false }, // Null for public Contact Us, set for In-App Feedback
  userEmail: { type: String, required: true },
  userName: { type: String, required: true },
  type: { type: String, enum: ["Contact", "Feedback", "Bug"], default: "Contact" },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Ticket || mongoose.model("Ticket", TicketSchema);
