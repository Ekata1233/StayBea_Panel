import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { SexualOrientation } from "@/models/SexualOrientation";
import mongoose from "mongoose";
import { sexualOrientationPatchSchema } from "@/validation/sexualOrientation";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ GET by ID
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  if (!mongoose.isValidObjectId(params.id))
    return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400, headers: corsHeaders });

  const doc = await SexualOrientation.findById(params.id).lean();
  if (!doc)
    return NextResponse.json({ success: false, message: "Not Found" }, { status: 404, headers: corsHeaders });

  return NextResponse.json({ success: true, data: doc }, { status: 200, headers: corsHeaders });
}

// ✅ PATCH by ID
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  if (!mongoose.isValidObjectId(params.id))
    return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400, headers: corsHeaders });

  try {
    const body = await req.json();
    const parsed = sexualOrientationPatchSchema.safeParse(body);

     if (!parsed.success) {
      return NextResponse.json(
        { success: false, errors: parsed.error.format() }, // ✅ use format() instead of .errors
        { status: 400, headers: corsHeaders }
      );
    }

    const updated = await SexualOrientation.findByIdAndUpdate(params.id, parsed.data, { new: true }).lean();
    if (!updated)
      return NextResponse.json({ success: false, message: "Not Found" }, { status: 404, headers: corsHeaders });

    return NextResponse.json({ success: true, data: updated }, { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}

// ✅ DELETE by ID
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  if (!mongoose.isValidObjectId(params.id))
    return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400, headers: corsHeaders });

  const deleted = await SexualOrientation.findByIdAndDelete(params.id).lean();
  if (!deleted)
    return NextResponse.json({ success: false, message: "Not Found" }, { status: 404, headers: corsHeaders });

  return NextResponse.json({ success: true, data: deleted }, { status: 200, headers: corsHeaders });
}
