"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Loader from "@/components/common/Loader";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEmployeeRoleContext } from "@/context/EmployeeRoleContext";
import { all } from "axios";
import { Pencil, Trash2, Eye, ShieldAlert, CheckCircle, XCircle, Users, Settings, FileText, Calendar, DollarSign, Clock, MoreHorizontal } from "lucide-react";
import React from "react";

// Module icons mapping for better visual representation
const moduleIcons: Record<string, any> = {
  users: Users,
  employees: Users,
  roles: ShieldAlert,
  settings: Settings,
  reports: FileText,
  attendance: Clock,
  leave: Calendar,
  payroll: DollarSign,
  default: MoreHorizontal
};

const EmployeeRolePage = () => {
  const { employeeRoles, employeeRoleLoading, employeeRoleError } =
    useEmployeeRoleContext();


  // Helper function to format permission actions nicely
  const formatActions = (actions: Record<string, boolean>) => {
    const actionLabels: Record<string, string> = {
      all: 'All',
      create: 'Create',
      read: 'View',
      update: 'Edit',
      delete: 'Delete',
      approve: 'Approve',
      export: 'Export',
      import: 'Import'
    };

    return Object.entries(actions)
      .filter(([_, value]) => value)
      .map(([action]) => actionLabels[action] || action)
      .join(' • ');
  };

  if (employeeRoleLoading) return <Loader />;
  if (employeeRoleError) return <p>Error: {employeeRoleError}</p>;

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Employee Role List" />

      <div className="mt-5 rounded-lg border border-stroke bg-white px-5 pb-4 pt-6 shadow-md dark:border-strokedark dark:bg-boxdark sm:px-7.5">
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Employee Roles
          </h4>
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            Total Roles: {employeeRoles.length}
          </span>
        </div>

        <div className="flex flex-col overflow-x-auto">
          {/* Table Header */}
          <div className="grid grid-cols-12 rounded-md bg-gray-2 text-sm font-semibold dark:bg-meta-4">
            <div className="col-span-2 p-3">Role Name</div>
            <div className="col-span-6 p-3">Permissions</div>
            <div className="col-span-1 p-3 text-center">Status</div>
            {/* <div className="col-span-2 p-3 text-center">Created At</div> */}
            <div className="col-span-1 p-3 text-center">Actions</div>
          </div>

          {/* Empty State */}
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
                You haven't created any employee roles yet. Create a role to
                manage permissions and access control.
              </p>
            </div>
          ) : (
            employeeRoles.map((role: any, index: number) => (
              <div
                key={role._id}
                className={`grid grid-cols-12 items-center transition hover:bg-gray-50 dark:hover:bg-meta-3 ${
                  index === employeeRoles.length - 1
                    ? ""
                    : "border-b border-stroke dark:border-strokedark"
                }`}
              >
                {/* Role Name */}
                <div className="col-span-2 p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <ShieldAlert size={18} className="text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-black dark:text-white">
                        {role.roleName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {role._id.slice(-6)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Permissions - Redesigned */}
                <div className="col-span-6 p-3">
                  <div className="space-y-2">
                    {Object.entries(role.permissions || {}).length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(role.permissions || {}).map(
                          ([module, actions]: [string, any], idx) => {
                            const enabledCount = Object.values(actions).filter(Boolean).length;
                            const totalCount = Object.keys(actions).length;
                            
                            return (
                              <div
                                key={idx}
                                className="rounded-lg border border-stroke bg-gray-50 p-2 dark:border-strokedark dark:bg-meta-4"
                              >
                                <div className="mb-1 flex items-center justify-between">
                                  <div className="flex items-center text-xs font-medium text-black dark:text-white">
                                    {/* {getModuleIcon(module)} */}
                                    <span className="capitalize">{module}</span>
                                  </div>
                                  <span className="text-[10px] text-gray-500">
                                    {enabledCount}/{totalCount}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(actions).map(
                                    ([action, enabled]: [string, any]) => (
                                      <span
                                        key={action}
                                        className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${
                                          enabled
                                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                            : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                                        }`}
                                      >
                                        {enabled ? (
                                          <CheckCircle size={8} className="mr-0.5" />
                                        ) : (
                                          <XCircle size={8} className="mr-0.5" />
                                        )}
                                        {action}
                                      </span>
                                    )
                                  )}
                                </div>
                              </div>
                            );
                          }
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No permissions assigned</span>
                    )}
                  </div>
                </div>

                {/* Status */}
                <div className="col-span-1 p-3 text-center">
                  {Object.keys(role.permissions || {}).length > 0 ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-600 dark:bg-green-900 dark:text-green-300">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-600"></span>
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600 dark:bg-red-900 dark:text-red-300">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-red-600"></span>
                      Inactive
                    </span>
                  )}
                </div>

                {/* Created Date */}
                {/* <div className="col-span-2 p-3 text-center">
                  <div className="text-sm text-black dark:text-white">
                    {new Date(role.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(role.createdAt).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div> */}

                {/* Actions */}
                <div className="col-span-1 flex justify-center gap-1 p-3">
                  <button className="rounded-lg bg-purple-100 p-2 text-purple-600 transition-colors hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50">
                    <Eye size={16} />
                  </button>

                  <button className="rounded-lg bg-blue-100 p-2 text-blue-600 transition-colors hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50">
                    <Pencil size={16} />
                  </button>

                  <button className="rounded-lg bg-red-100 p-2 text-red-600 transition-colors hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50">
                    <Trash2 size={16} />
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