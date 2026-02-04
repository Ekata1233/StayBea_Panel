import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDatabase } from "@/utils/db";
import EmployeeModel from "@/models/Employee";
import { loginSchema } from "@/validation/login";
import '@/models/EmployeeRole'

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// ============================
// POST → Login
// ============================
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    // ✅ Validate input
    const { email, password } = loginSchema.parse(body);

    // ✅ Find user (email index recommended)
    const employee = await EmployeeModel.findOne({ email })
      .populate("role")
      .select("+password"); // make sure password is selectable

    // ❌ Generic error (security)
    if (!employee) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401, headers: corsHeaders }
      );
    }

    // ❌ Account status check
    if (!employee.isActive) {
      return NextResponse.json(
        { success: false, message: "Account is inactive" },
        { status: 403, headers: corsHeaders }
      );
    }

    // ✅ Compare password
    const isPasswordValid = await bcrypt.compare(
      password,
      employee.password
    );

    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401, headers: corsHeaders }
      );
    }

    // ✅ Create JWT (24 hours)
    const token = jwt.sign(
      {
        userId: employee._id,
        role: employee.role?.roleName,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "24h" }
    );

    // ✅ Hide password before response
    employee.password = undefined as any;

    // ✅ Set HTTP-only cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          user: employee,
        },
      },
      { headers: corsHeaders }
    );

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("LOGIN ERROR:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, errors: error.errors },
        { status: 400, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { success: false, message: "Something went wrong" },
      { status: 500, headers: corsHeaders }
    );
  }
}
