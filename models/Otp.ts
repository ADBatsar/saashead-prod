import mongoose from "mongoose";

const OtpSchema = new mongoose.Schema({
    phone: { type: String, required: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ["login", "reset_password"], required: true },
    createdAt: { type: Date, default: Date.now, expires: 300 } // Auto-deletes after 5 minutes (300 seconds)
});

export default mongoose.models.Otp || mongoose.model("Otp", OtpSchema);
