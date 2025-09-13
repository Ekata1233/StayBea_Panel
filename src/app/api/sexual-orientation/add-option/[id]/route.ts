import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { SexualOrientation } from "@/models/SexualOrientation";
import mongoose from "mongoose";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ PATCH: Add new option(s) by document ID
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;

    // Validate document ID
    if (!mongoose.isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid document ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const body = await req.json();

    // Normalize to array (support adding one or multiple options)
    const options = Array.isArray(body) ? body : [body];

    // Validate each option
    for (const opt of options) {
      if (!opt.label || !opt.description) {
        return NextResponse.json(
          { success: false, message: "Each option requires label and description" },
          { status: 400, headers: corsHeaders }
        );
      }
    }

    // Push options into document
    const updated = await SexualOrientation.findByIdAndUpdate(
      id,
      { $push: { options: { $each: options } } },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Option(s) added successfully", data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("PATCH /sexual-orientation/add-options/[id] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
