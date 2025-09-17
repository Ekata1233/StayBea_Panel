// // app/api/looking-for/[id]/route.ts
// import { NextResponse } from "next/server";
// import { connectToDatabase } from "@/utils/db";
// import { LookingFor } from "@/models/LookingFor";

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // ✅ OPTIONS (CORS preflight)
// export async function OPTIONS() {
//   return NextResponse.json({}, { status: 204, headers: corsHeaders });
// }

// // ✅ PATCH route
// export async function PATCH(req: Request, { params }: { params: { id: string } }) {
//   try {
//     await connectToDatabase();
//     const body = await req.json();

//     // ✅ Update parent fields (title, description, or whole options array)
//     if (body.title || body.description || body.options) {
//       const updated = await LookingFor.findByIdAndUpdate(
//         params.id,
//         { $set: body },
//         { new: true }
//       );

//       if (!updated) {
//         return NextResponse.json(
//           { success: false, message: "Document not found" },
//           { status: 404, headers: corsHeaders }
//         );
//       }

//       return NextResponse.json(
//         { success: true, message: "LookingFor updated successfully", data: updated },
//         { status: 200, headers: corsHeaders }
//       );
//     }

//     // ✅ Update only one option (label + description) by optionId
//     if (body.optionId && (body.label || body.description)) {
//       const updateFields: Record<string, any> = {};
//       if (body.label) updateFields["options.$.label"] = body.label;
//       if (body.description) updateFields["options.$.description"] = body.description;

//       const updated = await LookingFor.findOneAndUpdate(
//         { _id: params.id, "options._id": body.optionId },
//         { $set: updateFields },
//         { new: true }
//       );

//       if (!updated) {
//         return NextResponse.json(
//           { success: false, message: "Option not found" },
//           { status: 404, headers: corsHeaders }
//         );
//       }

//       return NextResponse.json(
//         { success: true, message: "Option updated successfully", data: updated },
//         { status: 200, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: false, message: "Invalid request body" },
//       { status: 400, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       { success: false, message: error.message },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }


// app/api/looking-for/[id]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/utils/db";
import { LookingFor } from "@/models/LookingFor";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { status: 204, headers: corsHeaders });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const body = await req.json();

    // ✅ First: check if updating a nested option
    if (body.optionId && (body.label || body.description)) {
      const updateFields: Record<string, any> = {};
      if (body.label) updateFields["options.$.label"] = body.label;
      if (body.description) updateFields["options.$.description"] = body.description;

      const updated = await LookingFor.findOneAndUpdate(
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

    // ✅ Otherwise: update parent fields
    if (body.title || body.description || body.options) {
      const updated = await LookingFor.findByIdAndUpdate(
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
        { success: true, message: "LookingFor updated successfully", data: updated },
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
