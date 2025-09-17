// app/api/looking-for/[id]/route.ts
import { LookingFor } from "@/models/LookingFor";
import { connectToDatabase } from "@/utils/db";
import { NextResponse } from "next/server";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ✅ OPTIONS (CORS preflight)
export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ PATCH (Add new option to LookingFor)
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    if (!body?.label || !body?.description) {
      return NextResponse.json(
        { success: false, message: "Option label and description are required" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Add new option to options array
    const updated = await LookingFor.findByIdAndUpdate(
      id,
      {
        $push: {
          options: {
            label: body.label,
            description: body.description,
          },
        },
      },
      { new: true } // return updated document
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, message: "Document not found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Option added successfully",
        data: updated,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("PATCH /looking-for/[id] error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
