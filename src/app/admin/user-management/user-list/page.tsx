"use client";

import React, { useMemo } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Loader from "@/components/common/Loader";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import GenericTable from "@/components/ui/GenericTable";
import { useUserContext } from "@/context/UserContext";

const Page = () => {
  const { user, userLoading, userError } = useUserContext();

  if (userLoading) return <Loader />;
  if (userError) return <p>{userError}</p>;

  // ================= TABLE COLUMNS =================
  const columns = [
    {
      header: "Name",
      accessor: "name",
      align: "left" as const,
      render: (row: any) => (
        <span className="font-medium text-black dark:text-white">
          {row.name || "-"}
        </span>
      ),
    },
    {
      header: "Email",
      accessor: "email",
      align: "left" as const,
      render: (row: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.email || "-"}
        </span>
      ),
    },
    {
      header: "Phone Number",
      accessor: "phone_number",
      align: "left" as const,
      render: (row: any) => (
        <span className="text-gray-700 dark:text-gray-300">
          {row.phone_number || "-"}
        </span>
      ),
    },
    {
      header: "Phone Verified",
      accessor: "is_phone_verified",
      align: "center" as const,
      render: (row: any) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.is_phone_verified
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {row.is_phone_verified ? "Verified" : "Not Verified"}
        </span>
      ),
    },
    {
      header: "Onboarding",
      accessor: "onboarding_completed",
      align: "center" as const,
      render: (row: any) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.onboarding_completed
              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
          }`}
        >
          {row.onboarding_completed ? "Completed" : "Pending"}
        </span>
      ),
    },
    {
      header: "Created At",
      accessor: "created_at",
      align: "left" as const,
      render: (row: any) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
  ];

  // ================= FORMAT DATA =================
  const formattedData = useMemo(() => {
    return user || [];
  }, [user]);

  return (
    <DefaultLayout>
      <Breadcrumb pageName="User List" />

      <div className="mt-6">
        <GenericTable
          title="Users"
          columns={columns}
          data={formattedData}
          showActions={false}
          showView={false}
          showEdit={false}
          showDelete={false}
          minWidth="1000px"
          isDeleting={null}
        />
      </div>
    </DefaultLayout>
  );
};

export default Page;