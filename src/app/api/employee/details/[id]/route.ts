// File: /app/api/employeeRoles/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import EmployeeRoleModel from "@/models/EmployeeRole";
import { connectToDatabase } from "@/utils/db";
import { employeeRoleSchema } from "@/validation/employeeRole";
import Employee from "@/models/Employee";

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Handle OPTIONS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}


export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    const { id } = params;
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Missing id parameter" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch single employee by id (exclude password)
    const employee = await Employee.findById(id).select("-password");

    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Employee not found", data: null },
        { status: 404, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: employee },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}