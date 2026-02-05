import { getAuthUser } from "@/lib/auth/getAuthUser";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = getAuthUser();

    return NextResponse.json(
      {
        success: true,
        user: {
          userId: user.userId,
          role: user.role,
          permissions: user.permissions,
          manageAccess: user.manageAccess,
        },
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }
}
