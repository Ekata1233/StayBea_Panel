import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { SexualOrientation } from "@/models/SexualOrientation";
import { sexualOrientationSchema } from "@/validation/sexualOrientation";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

// ✅ POST - create new sexual orientation
export async function POST(req: NextRequest) {
  await connectToDatabase();

  try {
    const body = await req.json();

    // Support single object or array of objects
    const items = Array.isArray(body) ? body : [body];
    const createdItems: any[] = [];

    for (const item of items) {
      const parsed = sexualOrientationSchema.safeParse(item);
      if (!parsed.success) {
        return NextResponse.json(
          { success: false, errors: parsed.error.format() }, // ✅ safe Zod validation
          { status: 400, headers: corsHeaders }
        );
      }

      const created = await SexualOrientation.create(parsed.data);
      createdItems.push(created);
    }

    return NextResponse.json(
      { success: true, data: createdItems },
      { status: 201, headers: corsHeaders }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500, headers: corsHeaders }
    );
  }
}



// ✅ GET - get all sexual orientations
export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");

    const filter: any = {};
    if (search) {
      const searchRegex = { $regex: search, $options: "i" };
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { "options.label": searchRegex },
      ];
    }

    const docs = await SexualOrientation.find(filter).lean();

    if (!docs || docs.length === 0) {
      return NextResponse.json(
        { success: true, message: "No data available", data: [] },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: docs },
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

