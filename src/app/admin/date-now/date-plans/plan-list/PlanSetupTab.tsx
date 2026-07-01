import React, { useState } from "react";
import GenericTable from "@/components/ui/GenericTable";
import { Search, X, Eye, Edit, Settings, Calendar, Clock, Users } from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";
import { PlanData } from "./index";

interface PlanSetupTabProps {
  plans: PlanData[];
}

export default function PlanSetupTab({ plans }: PlanSetupTabProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter plans that need setup (VIP+ visibility in this example)
  const setupPlans = plans.filter(
    (plan) =>
      plan.visibility === "VIP+" &&
      (searchQuery === "" ||
        plan.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plan.plan.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const columns = [
    {
      header: "HOST",
      accessor: "host",
      width: "180px",
      align: "left" as const,
      render: (row: PlanData) => (
        <div className="flex items-center gap-3">
          <div className="relative h-10 w-10 flex-shrink-0">
            {row.profileImage ? (
              <Image
                src={row.profileImage}
                alt={row.host}
                width={40}
                height={40}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700"
              />
            ) : (
              <div className={`flex h-10 w-10 items-center justify-center rounded-full ${row.color} text-sm font-semibold text-gray-700`}>
                {row.initials}
              </div>
            )}
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">{row.host}</span>
        </div>
      ),
    },
    {
      header: "PLAN",
      accessor: "plan",
      width: "150px",
      align: "left" as const,
      render: (row: PlanData) => <span className="text-sm text-gray-700 dark:text-gray-300">{row.plan}</span>,
    },
    {
      header: "SETUP DETAILS",
      accessor: "details",
      width: "200px",
      align: "left" as const,
      render: (row: PlanData) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{row.venueWhen}</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">{row.requests} requests</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-700 dark:text-gray-300">Setup needed</span>
          </div>
        </div>
      ),
    },
    {
      header: "STATUS",
      accessor: "status",
      width: "120px",
      align: "left" as const,
      render: (row: PlanData) => (
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">
            <Settings className="h-3 w-3" />
            Setup pending
          </span>
          <div className="text-xs text-gray-400">Requires approval</div>
        </div>
      ),
    },
    {
      header: "ACTIONS",
      accessor: "actions",
      width: "200px",
      align: "center" as const,
      render: (row: PlanData) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => toast.info(`Setup plan: ${row.plan}`)}
            className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Settings className="inline h-4 w-4 mr-1" />
            Setup
          </button>
          <button
            onClick={() => toast.info(`Editing setup for: ${row.plan}`)}
            className="rounded-lg p-2 text-green-600 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-900/20"
            title="Edit setup"
          >
            <Edit size={18} />
          </button>
          <button
            onClick={() => toast.info(`Viewing setup for: ${row.plan}`)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20"
            title="View setup"
          >
            <Eye size={18} />
          </button>
        </div>
      ),
    },
  ];

  const totalSetupPlans = plans.filter((p) => p.visibility === "VIP+").length;

  return (
    <div>
      {/* Search */}
      <div className="mb-6 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search host or plan.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
              Clear
            </button>
          )}
        </div>
      </div>

      <GenericTable
        title={`Plan Setup (${setupPlans.length} of ${totalSetupPlans})`}
        columns={columns}
        data={setupPlans}
        showActions={false}
        showView={false}
        showEdit={false}
        showDelete={false}
      />
    </div>
  );
}