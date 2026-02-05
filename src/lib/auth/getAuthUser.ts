import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string;
    role: string;
    permissions: string[];
    manageAccess: {
      Add: boolean;
      Update: boolean;
      Delete: boolean;
      View: boolean;
      Export: boolean;
    };
  };

  return decoded;
}
