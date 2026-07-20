import mongoose, { Schema, models, model } from "mongoose";

const CompanySchema = new Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
    },

    companyCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },

    domain: {
      type: String,
      required: true,
      lowercase: true,
    },

    country: {
      type: String,
      required: true,
    },

    adminEmail: {
      type: String,
      required: true,
      lowercase: true,
    },

    plan: {
      type: String,
      enum: ["Trial", "Business", "Enterprise"],
      default: "Trial",
    },

    status: {
      type: String,
      enum: ["Active", "Trial", "Suspended"],
      default: "Trial",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default models.Company || model("Company", CompanySchema);
