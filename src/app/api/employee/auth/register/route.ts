// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// import EmployeeModel from "@/models/Employee";
// import EmployeeRoleModel from "@/models/EmployeeRole";
// import { connectToDatabase } from "@/utils/db";
// import { employeeSchemaWithConfirm } from "@/validation/employee";

// // CORS headers
// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
//   "Access-Control-Allow-Headers": "Content-Type, Authorization",
// };

// // Handle OPTIONS preflight
// export async function OPTIONS() {
//   return NextResponse.json({}, { headers: corsHeaders });
// }

// // ============================
// // POST → Add Employee
// // ============================
// export async function POST(req: NextRequest) {
//   try {
//     await connectToDatabase();

//     // Parse body
//     const body = await req.json();

//     console.log("body : ", body);

//     // Zod validation
//     const parsedData = employeeSchemaWithConfirm.parse(body);

//     // Check duplicate email
//     const existingEmployee = await EmployeeModel.findOne({
//       email: parsedData.email,
//     });

//     if (existingEmployee) {
//       return NextResponse.json(
//         { success: false, message: "Employee email already exists ❌" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Check role exists
//     const roleExists = await EmployeeRoleModel.findById(parsedData.role);
//     if (!roleExists) {
//       return NextResponse.json(
//         { success: false, message: "Invalid employee role ❌" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Hash password
//     const hashedPassword = await bcrypt.hash(parsedData.password, 10);

//     // Create employee
//     const newEmployee = new EmployeeModel({
//       firstName: parsedData.firstName,
//       lastName: parsedData.lastName,
//       phone: parsedData.phone,
//       address: parsedData.address,
//       image: parsedData.image,
//       role: parsedData.role,
//       identityType: parsedData.identityType,
//       identityNumber: parsedData.identityNumber,
//       identityImage: parsedData.identityImage,
//       email: parsedData.email,
//       password: hashedPassword,
//       isActive: parsedData.isActive,
//     });

//     await newEmployee.save();

//     return NextResponse.json(
//       { success: true, data: newEmployee },
//       { status: 201, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     // Zod errors
//      console.error("ERROR:", error);
//     if (error.name === "ZodError") {
//       console.error("ZOD ERRORS:", error.errors);
//       return NextResponse.json(
//         { success: false, errors: error.errors },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     // Duplicate key (MongoDB unique email)
//     if (error.code === 11000) {
//       return NextResponse.json(
//         { success: false, message: "Email already exists ❌" },
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Something went wrong",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

// // ============================
// // GET → Get All Employees
// // ============================
// export async function GET() {
//   try {
//     await connectToDatabase();

//     const employees = await EmployeeModel.find()
//       .populate("role")
//       .sort({ createdAt: -1 });

//     if (!employees || employees.length === 0) {
//       return NextResponse.json(
//         { success: false, message: "No employees found", data: [] },
//         { status: 200, headers: corsHeaders }
//       );
//     }

//     return NextResponse.json(
//       { success: true, data: employees },
//       { status: 200, headers: corsHeaders }
//     );
//   } catch (error: any) {
//     return NextResponse.json(
//       {
//         success: false,
//         message: error.message || "Something went wrong",
//       },
//       { status: 500, headers: corsHeaders }
//     );
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import EmployeeModel from "@/models/Employee";
import EmployeeRoleModel from "@/models/EmployeeRole";
import { connectToDatabase } from "@/utils/db";
import imagekit from "@/utils/imagekit";
import { employeeSchemaWithConfirm } from "@/validation/employee";

// CORS
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    // Parse FormData
    const formData = await req.formData();

    console.log("Received FormData:", formData);

    const body = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      phone: formData.get("phone"),
      address: formData.get("address"),
      role: formData.get("role"),
      identityType: formData.get("identityType"),
      identityNumber: formData.get("identityNumber"),
      email: formData.get("email"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
      isActive: formData.get("isActive") === "true",
    };

    // Files
    const imageFile = formData.get("imageFile") as File;
    const identityFile = formData.get("identityFile") as File;

    console.log("Received body:", body);
    console.log("Received image file:", imageFile);
    console.log("Received identity file:", identityFile);

    let imageUrl = "";
    let identityImageUrl = "";

    // Upload employee image
    if (imageFile) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const upload = await imagekit.upload({
        file: buffer,
        fileName: imageFile.name,
        folder: "/employees",
      });

      imageUrl = upload.url;
    }

    // Upload identity image
    if (identityFile) {
      const bytes = await identityFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const upload = await imagekit.upload({
        file: buffer,
        fileName: identityFile.name,
        folder: "/employees/identity",
      });

      identityImageUrl = upload.url;
    }

    const parsedData = employeeSchemaWithConfirm.parse({
      ...body,
      image: imageUrl,
      identityImage: identityImageUrl,
    });

    // Check email
    const existingEmployee = await EmployeeModel.findOne({
      email: parsedData.email,
    });

    if (existingEmployee) {
      return NextResponse.json(
        { success: false, message: "Employee email already exists ❌" },
        { status: 400, headers: corsHeaders },
      );
    }

    // Check role
    const roleExists = await EmployeeRoleModel.findById(parsedData.role);
    if (!roleExists) {
      return NextResponse.json(
        { success: false, message: "Invalid employee role ❌" },
        { status: 400, headers: corsHeaders },
      );
    }

    const hashedPassword = await bcrypt.hash(parsedData.password, 10);

    const newEmployee = new EmployeeModel({
      ...parsedData,
      password: hashedPassword,
    });

    await newEmployee.save();

    return NextResponse.json(
      { success: true, data: newEmployee },
      { status: 201, headers: corsHeaders },
    );
  } catch (error: any) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Something went wrong",
      },
      { status: 500, headers: corsHeaders },
    );
  }
}
