"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { ChevronDownIcon } from "lucide-react";
import React, { useState } from "react";

const AddEmployee = () => {
  const [selectedRole, setSelectedRole] = useState("");
  const [identityType, setIdentityType] = useState("");

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
  ];

  const identityOptions = [
    { value: "aadhar", label: "Aadhar" },
    { value: "pan", label: "PAN" },
    { value: "passport", label: "Passport" },
  ];

  return (
    <DefaultLayout>
      <>
        <Breadcrumb pageName="Add Employee" />

        <div className="flex flex-col gap-9">
          {/* General Information */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                General Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-5.5 p-6.5 md:grid-cols-3">
              {/* First Column */}
              <div className="flex flex-col gap-5.5">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter First Name"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black 
                  outline-none transition focus:border-primary active:border-primary disabled:cursor-default 
                  disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white 
                  dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Phone Number"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black 
                  outline-none transition focus:border-primary active:border-primary disabled:cursor-default 
                  disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white 
                  dark:focus:border-primary"
                  />
                </div>
              </div>

              {/* Second Column */}
              <div className="flex flex-col gap-5.5">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Last Name"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black 
                  outline-none transition focus:border-primary active:border-primary disabled:cursor-default 
                  disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white 
                  dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Address
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Address"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black 
                  outline-none transition focus:border-primary active:border-primary disabled:cursor-default 
                  disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white 
                  dark:focus:border-primary"
                  />
                </div>
              </div>

              {/* Third Column */}
              <div className="flex flex-col gap-5.5">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Upload Image
                  </label>
                  <input
                    type="file"
                    className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition 
                  file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid 
                  file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 
                  focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter 
                  dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark 
                  dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Select Role
                  </label>
                  <div className="relative">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="w-full appearance-none rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 
                    text-black outline-none transition focus:border-primary active:border-primary 
                    dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select a role</option>
                      {roleOptions.map((role) => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Business Information
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-5.5 p-6.5 md:grid-cols-2">
              <div className="flex flex-col gap-5.5">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Identity Type
                  </label>
                  <div className="relative">
                    <select
                      value={identityType}
                      onChange={(e) => setIdentityType(e.target.value)}
                      className="w-full appearance-none rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 
                    text-black outline-none transition focus:border-primary active:border-primary 
                    dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                    >
                      <option value="">Select Identity Type</option>
                      {identityOptions.map((id) => (
                        <option key={id.value} value={id.value}>
                          {id.label}
                        </option>
                      ))}
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 pointer-events-none">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Identity Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Identity Number"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black 
                  outline-none transition focus:border-primary active:border-primary disabled:cursor-default 
                  disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white 
                  dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-5.5">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Upload Identity Image
                  </label>
                  <input
                    type="file"
                    className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent outline-none transition 
                  file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid 
                  file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 
                  focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter 
                  dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark 
                  dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Account Information
              </h3>
            </div>
            <div className="flex flex-col gap-5.5 p-6.5">
              <div className="grid grid-cols-1 gap-5.5 md:grid-cols-3">
                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter Email"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black 
                  outline-none transition focus:border-primary active:border-primary disabled:cursor-default 
                  disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white 
                  dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter Password"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black 
                  outline-none transition focus:border-primary active:border-primary disabled:cursor-default 
                  disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white 
                  dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black 
                  outline-none transition focus:border-primary active:border-primary disabled:cursor-default 
                  disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white 
                  dark:focus:border-primary"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-primary text-white hover:bg-opacity-90"
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    </DefaultLayout>
  );
};

export default AddEmployee;
