// File: /app/api/employeeRoles/route.ts
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import EmployeeRoleModel from "@/models/EmployeeRole";
import { connectToDatabase } from "@/utils/db";
import { employeeRoleSchema } from "@/validation/employeeRole";

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

// Handle POST request
export async function POST(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Parse and validate request body
    const body = await req.json();
    const parsedData = employeeRoleSchema.parse(body);

    // Check for duplicate roleName
    const existingRole = await EmployeeRoleModel.findOne({ roleName: parsedData.roleName });
    if (existingRole) {
      return NextResponse.json(
        { success: false, message: "Role name already exists" },
        { status: 400, headers: corsHeaders }
      );
    }

    // Create new EmployeeRole
    const newRole = new EmployeeRoleModel(parsedData);
    await newRole.save();

    return NextResponse.json(
      { success: true, data: newRole },
      { status: 201, headers: corsHeaders }
    );
  } catch (error: any) {
    // Handle Zod validation errors
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}


export async function GET(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Fetch all employee roles
    const roles = await EmployeeRoleModel.find();

    if (!roles || roles.length === 0) {
      return NextResponse.json(
        { success: false, message: "No employee roles found", data: [] },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: roles },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}