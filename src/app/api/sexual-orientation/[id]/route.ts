// app/api/sexual-orientation/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { SexualOrientation } from "@/models/SexualOrientation";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ PATCH route (update title, description, or full options)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // ✅ Update parent fields (title, description, or replace options array)
    if (body.title || body.description || body.options) {
      const updated = await SexualOrientation.findByIdAndUpdate(
        params.id,
        { $set: body },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Document not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { success: true, message: "Updated successfully", data: updated },
        { status: 200, headers: corsHeaders }
      );
    }

    // ✅ Update **only one option** (label + description)
    if (body.optionId && (body.label || body.description)) {
      const updateFields: any = {};
      if (body.label) updateFields["options.$.label"] = body.label;
      if (body.description)
        updateFields["options.$.description"] = body.description;

      const updated = await SexualOrientation.findOneAndUpdate(
        { _id: params.id, "options._id": body.optionId },
        { $set: updateFields },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json(
          { success: false, message: "Option not found" },
          { status: 404, headers: corsHeaders }
        );
      }

      return NextResponse.json(
        { success: true, message: "Option updated successfully", data: updated },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: "Invalid request body" },
      { status: 400, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}

// ✅ DELETE route (delete full document by id)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();

    const deleted = await SexualOrientation.findByIdAndDelete(params.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, message: "Deleted successfully" },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
