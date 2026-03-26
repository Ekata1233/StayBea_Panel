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


export async function GET(req: NextRequest) {
  try {
    // Connect to MongoDB
    await connectToDatabase();

    // Fetch all employees
    const employees = await Employee.find();

    if (!employees || employees.length === 0) {
      return NextResponse.json(
        { success: false, message: "No employees found", data: [] },
        { status: 200, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: true, data: employees },
      { status: 200, headers: corsHeaders }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}