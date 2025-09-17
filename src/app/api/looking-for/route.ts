// app/api/looking-for/route.ts
import { LookingFor } from "@/models/LookingFor";
import { connectToDatabase } from "@/utils/db";
import { lookingForZ } from "@/validation/lookingFor";
import { NextResponse } from "next/server";

// ✅ CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ POST (Create new LookingFor)
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const body = await req.json();

    console.log("LookingFor Body:", body);

    // Validate with Zod
    const parsed = lookingForZ.parse(body);

    const newLookingFor = await LookingFor.create(parsed);

    return NextResponse.json(
      {
        success: true,
        message: "LookingFor created successfully",
        data: newLookingFor,
      },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("POST /looking-for error:", error);

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

// ✅ GET (Fetch all LookingFor documents)
export async function GET() {
  try {
    await connectToDatabase();
    const data = await LookingFor.find();

    if (!data || data.length === 0) {
      return NextResponse.json(
        { success: false, message: "No LookingFor data found", data: [] },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "LookingFor data fetched successfully", data },
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("GET /looking-for error:", error);

    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
