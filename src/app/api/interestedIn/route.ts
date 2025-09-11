// app/api/interested-in/route.ts
import { InterestedIn } from "@/models/interestedIn";
import { connectToDatabase } from "@/utils/db";
import { interestedInZ } from "@/validation/interestedIn";
import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ POST (Create new InterestedIn)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    console.log("Body : ", body);

    // Validate with Zod
    const parsed = interestedInZ.parse(body);

    const newInterestedIn = await InterestedIn.create(parsed);

    return NextResponse.json(
      {
        success: true,
        message: "InterestedIn created successfully",
        data: newInterestedIn,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("POST /interested-in error:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, message: "Validation failed", errors: error.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ GET (Fetch all InterestedIn documents)
export async function GET() {
  try {
    await connectToDatabase();
    const data = await InterestedIn.find();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "No interestedIn data found", data: [] },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "interestedIn Data fetched successfully", data },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /interested-in error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

