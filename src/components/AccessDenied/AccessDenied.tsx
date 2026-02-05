"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function AccessDenied({
  title = "Access Denied",
  message = "You don’t have permission to view this page.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="flex items-center justify-center bg-gray-50 px-4 py-32">
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <ShieldAlert className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

        <p className="mt-2 text-gray-600">{message}</p>

        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            Go Home
          </Link>

          <Link
            href="/contact-admin"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Contact Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
