// app/api/interested-in/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { InterestedIn } from "@/models/InterestedIn";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ PATCH route
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // If you want to update parent fields directly (title, description, options)
    if (body.title || body.description || body.options) {
      const updated = await InterestedIn.findByIdAndUpdate(
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

    // ✅ If you want to update **only one option label**
    if (body.optionId && body.label) {
      const updated = await InterestedIn.findOneAndUpdate(
        { _id: params.id, "options._id": body.optionId },
        { $set: { "options.$.label": body.label } },
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
  