// app/api/looking-for/[id]/option/[optionId]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { LookingFor } from "@/models/LookingFor";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ DELETE a single option from LookingFor
export async function DELETE(
  req: Request,
  { params }: { params: { id: string; optionId: string } }
) {
  try {
    await connectToDatabase();

    const updated = await LookingFor.findByIdAndUpdate(
      params.id,
      { $pull: { options: { _id: params.optionId } } }, // remove option by _id
      { new: true }
    );

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
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
