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

// PATCH: update title/description, update existing options by _id, add new options
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ success: false, message: "Invalid ID" }, { status: 400, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const parsed = sexualOrientationPatchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, errors: parsed.error.format() }, { status: 400, headers: corsHeaders });
    }

    const { title, description, options } = parsed.data;

    // Update main fields (title/description) first (if provided)
    const mainUpdate: any = {};
    if (title !== undefined) mainUpdate.title = title;
    if (description !== undefined) mainUpdate.description = description;

    if (Object.keys(mainUpdate).length > 0) {
      await SexualOrientation.findByIdAndUpdate(params.id, { $set: mainUpdate }).exec();
    }

    // If options provided, process each:
    // - if option._id exists and matches an element, update that subdocument in-place
    // - otherwise push as new option
   if (Array.isArray(options) && options.length > 0) {
  for (const opt of options) {
    const label = opt.label ?? "";
    const desc = opt.description ?? "";

    if (opt._id && mongoose.isValidObjectId(opt._id)) {
      // Build $set object dynamically
      const setUpdate: any = {};
      if (opt.label !== undefined) setUpdate["options.$.label"] = label;
      if (opt.description !== undefined) setUpdate["options.$.description"] = desc;

      const res = await SexualOrientation.updateOne(
        { _id: params.id, "options._id": opt._id },
        { $set: setUpdate }
      ).exec();

      // If no matching option found, push new one
      if (res.matchedCount === 0) {
        const { _id, ...toPush } = opt as any;
        await SexualOrientation.findByIdAndUpdate(
          params.id,
          { $push: { options: toPush } }
        ).exec();
      }
    } else {
      // New option (no _id supplied)
      await SexualOrientation.findByIdAndUpdate(
        params.id,
        { $push: { options: opt } }
      ).exec();
    }
  }
}


    // Return the updated document
    const updated = await SexualOrientation.findById(params.id).lean();
    if (!updated) return NextResponse.json({ success: false, message: "Not Found" }, { status: 404, headers: corsHeaders });

    return NextResponse.json({ success: true, data: updated }, { status: 200, headers: corsHeaders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ success: false, message }, { status: 500, headers: corsHeaders });
  }
}





// ✅ DELETE by ID (document or option)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connectToDatabase();

  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json(
      { success: false, message: "Invalid document ID" },
      { status: 400, headers: corsHeaders }
    );
  }

  // Parse query param ?optionId=...
  const { searchParams } = new URL(req.url);
  const optionId = searchParams.get("optionId");

  try {
    let result;

    if (optionId) {
      // 🟢 Delete specific option inside the options array
      if (!mongoose.isValidObjectId(optionId)) {
        return NextResponse.json(
          { success: false, message: "Invalid option ID" },
          { status: 400, headers: corsHeaders }
        );
      }

      result = await SexualOrientation.findByIdAndUpdate(
        params.id,
        { $pull: { options: { _id: optionId } } },
        { new: true }
      ).lean();
    } else {
      // 🟢 Delete the whole document
      result = await SexualOrientation.findByIdAndDelete(params.id).lean();
    }

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Not Found" },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: result },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}

