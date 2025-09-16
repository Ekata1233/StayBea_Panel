"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Loader from "@/components/common/Loader";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEmployeeRoleContext } from "@/context/EmployeeRoleContext";
import { Pencil, Trash2, Eye } from "lucide-react";
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

      <div className="rounded-lg border border-stroke bg-white px-5 pb-4 pt-6 shadow-md dark:border-strokedark dark:bg-boxdark sm:px-7.5 mt-5">
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
          {employeeRoles.map((role, index) => (
            <div
              className={`grid grid-cols-4 sm:grid-cols-6 items-center hover:bg-gray-50 dark:hover:bg-meta-3 transition ${
                index === employeeRoles.length - 1
                  ? ""
                  : "border-b border-stroke dark:border-strokedark"
              }`}
              key={role._id}
            >
              {/* Role Name */}
              <div className="p-3 text-black dark:text-white font-medium">
                {role.roleName}
              </div>

              {/* Permissions */}
              <div className="p-3 text-center flex flex-wrap justify-center gap-1">
                {role.permissions.map((perm, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                  >
                    {perm}
                  </span>
                ))}
              </div>

              {/* Manage Access */}
              <div className="p-3 text-center flex flex-wrap justify-center gap-1">
                {Object.entries(role.manageAccess).map(([key, value], idx) => (
                  <span
                    key={idx}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      value
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {key}
                  </span>
                ))}
              </div>

              {/* Status */}
              <div className="text-center p-3">
                {Object.values(role.manageAccess).some(Boolean) ? (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300">
                    Active
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300">
                    Inactive
                  </span>
                )}
              </div>

              {/* Created At */}
              <div className="hidden sm:block text-center p-3 text-black dark:text-white">
                {new Date(role.createdAt).toLocaleDateString()}
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-2 p-3">
                <button className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 transition">
                  <Eye size={18} />
                </button>
                <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition">
                  <Pencil size={18} />
                </button>
                <button className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DefaultLayout>
  );
};

export default EmployeeRolePage;
