"use client";

import Alert from "@/components/Alert/GenericAlert";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { useEmployeeRoleContext } from "@/context/EmployeeRoleContext";
import { IEmployeeRole } from "@/types/employeeRole";
import React, { useState } from "react";

const EmployeeRolePage = () => {
  const [roleName, setRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const { addEmployeeRole, employeeRoleLoading } = useEmployeeRoleContext();
  const [alert, setAlert] = useState<{
  type: "success" | "error";
  message: string;
} | null>(null);


  // ✅ Permission groups
  const permissionGroups = [
    {
      group: "General",
      permissions: [
        "Dashboard",
        "Booking Management",
        "Transaction Management",
        "System Addon",
      ],
    },
    {
      group: "Promotion Management",
      permissions: [
        "Discounts",
        "Coupons",
        "Wallet Bonus",
        "Campaigns",
        "Advertisements",
        "Promotional Banners",
      ],
    },
    {
      group: "Provider Management",
      permissions: ["Onboarding Request", "Providers", "Withdraws"],
    },
  ];

  // ✅ Manage Access Options
  const manageAccessOptions = ["Add", "Update", "Delete", "View", "Export"] as const;

  // ✅ Strongly typed manageAccess state
  const [manageAccess, setManageAccess] = useState<
    Pick<IEmployeeRole, "manageAccess">["manageAccess"]
  >({
    Add: true,
    Update: true,
    Delete: true,
    View: true,
    Export: true,
  });

  // ✅ Toggle single permission
  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  // ✅ Toggle select all
  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedPermissions([]);
      setSelectAll(false);
    } else {
      const allPerms = permissionGroups.flatMap((group) => group.permissions);
      setSelectedPermissions(allPerms);
      setSelectAll(true);
    }
  };

  // ✅ Toggle manage access
  const toggleManageAccess = (opt: keyof typeof manageAccess) => {
    setManageAccess((prev) => ({
      ...prev,
      [opt]: !prev[opt],
    }));
  };

  // ✅ Reset form
  const handleReset = () => {
    setManageAccess({
      Add: true,
      Update: true,
      Delete: true,
      View: true,
      Export: true,
    });
    setSelectedPermissions([]);
    setRoleName("");
    setSelectAll(false);
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const newRole: Omit<IEmployeeRole, "_id"> = {
    roleName,
    permissions: selectedPermissions,
    manageAccess,
  };

  try {
    await addEmployeeRole(newRole);

    // ✅ success alert
    setAlert({
      type: "success",
      message: "Employee role created successfully 🎉",
    });

     window.scrollTo({ top: 0, behavior: "smooth" });

    handleReset();
  } catch (error) {
    setAlert({
    type: "error",
    message:
      error instanceof Error
        ? error.message
        : "Failed to create employee role.",
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
  }
  setTimeout(() => setAlert(null), 3000);
};


  return (
    <DefaultLayout>
      <Breadcrumb pageName="Create New Role" />
{alert && (
  <Alert
    type={alert.type}
    message={alert.message}
    onClose={() => setAlert(null)}
  />
)}


      <form onSubmit={handleSubmit} className="flex flex-col gap-9">
        {/* Role Name Section */}
        <div className="w-full rounded border-[1.5px] border-stroke bg-white dark:border-form-strokedark dark:bg-form-input">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">Role Name</h3>
          </div>
          <div className="p-6.5">
            <input
              type="text"
              value={roleName}
              onChange={(e) => setRoleName(e.target.value)}
              placeholder="Enter Role Name"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 
                text-black outline-none transition focus:border-primary active:border-primary 
                disabled:cursor-default disabled:bg-whiter 
                dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              required
            />
          </div>
        </div>

        {/* Permissions Section */}
        <div className="w-full rounded border-[1.5px] border-stroke bg-white dark:border-form-strokedark dark:bg-form-input">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark flex justify-between items-center">
            <h3 className="font-medium text-black dark:text-white">Permissions / Accesses</h3>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
              Select All
            </label>
          </div>
          <div className="p-6.5 grid gap-6 md:grid-cols-2">
            {permissionGroups.map((group) => (
              <div
                key={group.group}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent p-4 dark:border-form-strokedark dark:bg-form-input"
              >
                <h3 className="font-medium mb-3 text-black dark:text-white">{group.group}</h3>
                <div className="grid gap-2">
                  {group.permissions.map((perm) => (
                    <label
                      key={perm}
                      className="flex items-center gap-2 text-black dark:text-white"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(perm)}
                        onChange={() => togglePermission(perm)}
                      />
                      {perm}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Manage Access Section */}
        <div className="w-full rounded border-[1.5px] border-stroke bg-white dark:border-form-strokedark dark:bg-form-input">
          <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
            <h3 className="font-medium text-black dark:text-white">Manage Access</h3>
          </div>
          <div className="p-6.5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {manageAccessOptions.map((opt) => (
                <div
                  key={opt}
                  className="flex flex-col items-center text-black dark:text-white"
                >
                  <span className="text-sm font-medium mb-2">{opt}</span>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={manageAccess[opt]}
                      onChange={() => toggleManageAccess(opt)}
                      className="sr-only peer"
                    />
                    <div
                      className="peer h-6 w-11 rounded-full border-[1.5px] border-stroke bg-transparent dark:border-form-strokedark 
                        after:absolute after:top-0.5 after:left-[2px] after:h-5 after:w-5 after:rounded-full 
                        after:bg-white dark:after:bg-black after:transition-all 
                        peer-checked:bg-blue-600 peer-checked:after:translate-x-full"
                    ></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto rounded border-[1.5px] border-stroke bg-transparent px-6 py-2 
              text-black hover:bg-gray-200 dark:border-form-strokedark dark:bg-form-input dark:text-white dark:hover:bg-boxdark"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={employeeRoleLoading}
            className="w-full sm:w-auto rounded border-[1.5px] border-stroke bg-primary px-6 py-2 
              text-white hover:bg-blue-700 dark:border-form-strokedark disabled:opacity-60"
          >
            {employeeRoleLoading ? "Submitting..." : "Submit"}
          </button>
        </div>
      </form>
    </DefaultLayout>
  );
};

export default EmployeeRolePage;
