"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Loader from "@/components/common/Loader";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEmployeeRoleContext } from "@/context/EmployeeRoleContext";
import { Pencil, Trash2, Eye, ShieldAlert } from "lucide-react";
import React from "react";

const EmployeeRolePage = () => {
  const { employeeRoles, employeeRoleLoading, employeeRoleError } =
    useEmployeeRoleContext();

  console.log("employeeRoles", employeeRoles);

  if (employeeRoleLoading) return <Loader />;
  if (employeeRoleError) return <p>Error: {employeeRoleError}</p>;

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Employee Role List" />

      <div className="mt-5 rounded-lg border border-stroke bg-white px-5 pb-4 pt-6 shadow-md dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Employee Roles
        </h4>

        <div className="flex flex-col overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-4 rounded-md bg-gray-2 text-sm font-semibold dark:bg-meta-4 sm:grid-cols-6">
            <div className="p-3">Role Name</div>
            <div className="p-3 text-center">Permissions</div>
            <div className="p-3 text-center">Manage Access</div>
            <div className="p-3 text-center">Status</div>
            <div className="p-3 text-center sm:block">Created At</div>
            <div className="p-3 text-center">Actions</div>
          </div>

          {/* Table Rows */}
          {employeeRoles.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-gray-100 p-4 dark:bg-meta-4">
                <ShieldAlert
                  size={40}
                  className="text-gray-400 dark:text-gray-300"
                />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-black dark:text-white">
                No Employee Roles Found
              </h3>

              <p className="max-w-sm text-sm text-gray-500 dark:text-gray-400">
                You haven’t created any employee roles yet. Create a role to
                manage permissions and access control.
              </p>
            </div>
          ) : (
            employeeRoles.map((role, index) => (
              <div
                className={`grid grid-cols-4 items-center transition hover:bg-gray-50 dark:hover:bg-meta-3 sm:grid-cols-6 ${
                  index === employeeRoles.length - 1
                    ? ""
                    : "border-b border-stroke dark:border-strokedark"
                }`}
                key={role._id}
              >
                {/* Role Name */}
                <div className="p-3 font-medium text-black dark:text-white">
                  {role.roleName}
                </div>

                {/* Permissions */}
                <div className="flex flex-wrap justify-center gap-1 p-3 text-center">
                  {role.permissions.map((perm, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-300"
                    >
                      {perm}
                    </span>
                  ))}
                </div>

                {/* Manage Access */}
                <div className="flex flex-wrap justify-center gap-1 p-3 text-center">
                  {Object.entries(role.manageAccess).map(
                    ([key, value], idx) => (
                      <span
                        key={idx}
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          value
                            ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                        }`}
                      >
                        {key}
                      </span>
                    ),
                  )}
                </div>

                {/* Status */}
                <div className="p-3 text-center">
                  {Object.values(role.manageAccess).some(Boolean) ? (
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-300">
                      Active
                    </span>
                  ) : (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-300">
                      Inactive
                    </span>
                  )}
                </div>

                {/* Created At */}
                <div className="hidden p-3 text-center text-black dark:text-white sm:block">
                  {new Date(role.createdAt).toLocaleDateString()}
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-2 p-3">
                  <button className="rounded-full bg-purple-100 p-2 text-purple-600 transition hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300">
                    <Eye size={18} />
                  </button>
                  <button className="rounded-full bg-blue-100 p-2 text-blue-600 transition hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300">
                    <Pencil size={18} />
                  </button>
                  <button className="rounded-full bg-red-100 p-2 text-red-600 transition hover:bg-red-200 dark:bg-red-900 dark:text-red-300">
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EmployeeRolePage;
