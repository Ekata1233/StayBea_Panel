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

// ✅ DELETE: Remove option by optionId
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; optionId: string } }
) {
  try {
    await connectToDatabase();

    const { id, optionId } = params;

    // Validate IDs
    if (!mongoose.isValidObjectId(id) || !mongoose.isValidObjectId(optionId)) {
      return NextResponse.json(
        { success: false, message: "Invalid document ID or option ID" },
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await SexualOrientation.findByIdAndUpdate(
      id,
      { $pull: { options: { _id: optionId } } },
      { new: true }
    ).lean();

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Document or option not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Option deleted successfully", data: updated },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("DELETE /sexual-orientation/[id]/option/[optionId] error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
