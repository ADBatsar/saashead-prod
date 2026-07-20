import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Company from "@/models/Company";

// GET all companies
export async function GET() {
  try {
    await connectDB();

    const companies = await Company.find().sort({
      createdAt: -1,
    });

    return NextResponse.json(companies);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch companies",
      },
      {
        status: 500,
      }
    );
  }
}

// Create company
export async function POST(req: Request) {
  try {
    await connectDB();

    const body = await req.json();

    const company = await Company.create(body);

    return NextResponse.json(company, {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to create company",
      },
      {
        status: 500,
      }
    );
  }
}
