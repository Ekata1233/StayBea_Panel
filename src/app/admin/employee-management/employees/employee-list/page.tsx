"use client";

import React, { useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Loader from "@/components/common/Loader";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import GenericTable from "@/components/ui/GenericTable";
import { useAuth } from "@/context/AuthContext";
import { useEmployeeContext } from "@/context/EmployeeContext";
import { useRouter } from "next/navigation";

const Page = () => {
  const router = useRouter();

  const {
    refreshEmployees,
    employees,
    employeeError,
    employeeLoading,
  } = useEmployeeContext();

  console.log("Employees in Context:", employees);

  const { user: authUser, loading } = useAuth();

  const canView = authUser?.permissions?.users?.View;
  const canEdit = authUser?.permissions?.users?.Update;
  const canDelete = authUser?.permissions?.users?.Delete;

  // Fetch employees
  useEffect(() => {
    refreshEmployees();
  }, []);

  if (loading || employeeLoading) return <Loader />;
  if (employeeError) return <p>{employeeError}</p>;

  // Table Columns
const columns = [
  {
    header: "Name",
    accessor: "name",
  },
  {
    header: "Email",
    accessor: "email",
  },
  {
    header: "Phone",
    accessor: "phone",
  },
  {
    header: "Role",
    accessor: "role",
  },
  {
    header: "Status",
    accessor: "status",
  },
];

  // Format employees for table
  const formattedData = employees.map((emp: any) => ({
    id: emp._id,
    name: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    phone: emp.phone,
    role: emp.role?.roleName || "N/A",
    status: emp.isActive ? "Active" : "Inactive",
  }));

  // View employee
  const handleViewUser = (row: any) => {
    router.push(`/employees/${row.id}`);
  };

  return (
    <DefaultLayout>
      <div>
        <Breadcrumb pageName="Employee List" />
      </div>

      <div className="mt-6">
        <GenericTable
          title="Employee List"
          columns={columns}
          data={formattedData}
          showActions={canView || canEdit || canDelete}
          showView={canView}
          showEdit={canEdit}
          showDelete={canDelete}
          onView={handleViewUser}
          minWidth="1000px"
          isDeleting={null}
        />
      </div>
    </DefaultLayout>
  );
};

export default Page;