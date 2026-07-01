"use client";

import React, { useState } from "react";
import {
  Search,
  ChevronDown,
  X,
  AlertTriangle,
  Flag,
} from "lucide-react";
import { toast } from "react-toastify";

// ---------- TYPE DEFINITIONS ----------
interface ReportData {
  id: number;
  reporter: string;
  reportedUser: string;
  plan: string;
  timeAgo: string;
  severity: "High" | "Medium" | "Low";
  status: "New" | "Reviewing" | "Actioned" | "Dismissed";
  type: "Post-date report" | "Card flag";
  reportedBy: string;
  issues: string[];
  description: string;
  initials: string;
  color: string;
}

// ---------- STATIC DATA ----------
const reportsData: ReportData[] = [
  {
    id: 1,
    reporter: "Priya Das",
    reportedUser: "Rohan Verma",
    plan: "Beach evening",
    timeAgo: "2 h ago",
    severity: "High",
    status: "New",
    type: "Post-date report",
    reportedBy: "Priya Das",
    issues: ["Didn't show as described", "Made me uncomfortable"],
    description:
      "Profile photos looked nothing like him and he was pushy about leaving the venue.",
    initials: "RV",
    color: "bg-red-200",
  },
  {
    id: 2,
    reporter: "Tanya Joshi",
    reportedUser: "Unknown · VB-10299",
    plan: "Ramen night",
    timeAgo: "1 d ago",
    severity: "High",
    status: "New",
    type: "Card flag",
    reportedBy: "Tanya Joshi",
    issues: ["Fake profile", "Safety concern"],
    description: "Suspect catfish — asked to move to WhatsApp immediately.",
    initials: "U",
    color: "bg-gray-200",
  },
  {
    id: 3,
    reporter: "Elena Dsouza",
    reportedUser: "Arjun Kapoor",
    plan: "Rooftop drinks",
    timeAgo: "5 h ago",
    severity: "Medium",
    status: "Reviewing",
    type: "Card flag",
    reportedBy: "Elena Dsouza",
    issues: ["Inappropriate behaviour"],
    description: "Sent inappropriate messages in the join request.",
    initials: "AK",
    color: "bg-blue-200",
  },
  {
    id: 4,
    reporter: "Chloe Pinto",
    reportedUser: "Sameer Khan",
    plan: "Cafe co-work",
    timeAgo: "2 d ago",
    severity: "Medium",
    status: "Actioned",
    type: "Post-date report",
    reportedBy: "Chloe Pinto",
    issues: ["Safety concern"],
    description: "Asked for money to 'cover a honkin''",
    initials: "SK",
    color: "bg-purple-200",
  },
];

// ---------- FILTER OPTIONS ----------
const severityLevels = ["All", "High", "Medium", "Low"];
const reportStatuses = ["All", "New", "Reviewing", "Actioned", "Dismissed"];

// ---------- COMPONENT ----------
export default function ReportsTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const filteredReports = reportsData.filter((report) => {
    const matchesSeverity = filterSeverity === "All" || report.severity === filterSeverity;
    const matchesStatus = filterStatus === "All" || report.status === filterStatus;
    const matchesSearch =
      searchQuery === "" ||
      report.reportedUser.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.reporter.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesStatus && matchesSearch;
  });

  const clearFilters = () => {
    setFilterSeverity("All");
    setFilterStatus("All");
    setSearchQuery("");
  };

  const handleAction = (action: string, report: ReportData) => {
    toast.success(`${action} action taken on report for ${report.reportedUser}`);
  };

  return (
    <div>
      {/* ===== FILTER BAR ===== */}
      <div className="mb-6 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-3">
          {/* Severity dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSeverityDropdownOpen(!isSeverityDropdownOpen)}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <AlertTriangle className="h-4 w-4" />
              {filterSeverity}
              <ChevronDown className="h-4 w-4" />
            </button>
            {isSeverityDropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
                <div className="py-1">
                  {severityLevels.map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        setFilterSeverity(level);
                        setIsSeverityDropdownOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        filterSeverity === level
                          ? "bg-blue-50 text-[#1877f2] dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
              className="flex items-center gap-1 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Flag className="h-4 w-4" />
              {filterStatus}
              <ChevronDown className="h-4 w-4" />
            </button>
            {isStatusDropdownOpen && (
              <div className="absolute left-0 top-full z-10 mt-1 w-48 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
                <div className="py-1">
                  {reportStatuses.map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setFilterStatus(status);
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        filterStatus === status
                          ? "bg-blue-50 text-[#1877f2] dark:bg-blue-900/20 dark:text-blue-400"
                          : "text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search reported user, plan or reporter.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>

          <span className="text-xs text-gray-400">Sorted by severity · safety first</span>

          {(filterSeverity !== "All" || filterStatus !== "All" || searchQuery) && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          )}
        </div>

        {/* Active filter badges */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {filterSeverity !== "All" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-800 dark:bg-red-900/30 dark:text-red-300">
              Severity: {filterSeverity}
              <button onClick={() => setFilterSeverity("All")} className="ml-1 hover:text-red-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {filterStatus !== "All" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              Status: {filterStatus}
              <button onClick={() => setFilterStatus("All")} className="ml-1 hover:text-blue-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              Search: &quot;{searchQuery}&quot;
              <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-gray-600">
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* ===== REPORT CARDS ===== */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400">
            No reports match your filters.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div
              key={report.id}
              className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800"
            >
              {/* Top row: user + severity + status */}
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full ${report.color} text-sm font-semibold text-gray-700`}
                  >
                    {report.initials}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {report.reportedUser}
                    </div>
                    <div className="text-xs text-gray-500">{report.type}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      report.severity === "High"
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        : report.severity === "Medium"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    }`}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {report.severity}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                      report.status === "New"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                        : report.status === "Reviewing"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                        : report.status === "Actioned"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {report.status}
                  </span>
                </div>
              </div>

              {/* Meta info: reported by, plan, time */}
              <div className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                Reported by {report.reportedBy} · {report.plan} · {report.timeAgo}
              </div>

              {/* Issues as tags */}
              <div className="mb-2 flex flex-wrap gap-1">
                {report.issues.map((issue, idx) => (
                  <span
                    key={idx}
                    className="rounded bg-red-50 px-1.5 py-0.5 text-xs text-red-700 dark:bg-red-900/30 dark:text-red-300"
                  >
                    {issue}
                  </span>
                ))}
              </div>

              {/* Description */}
              <p className="mb-3 text-sm text-gray-700 dark:text-gray-300">
                {report.description}
              </p>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-3 dark:border-gray-700">
                {["Review", "Warn", "Suspend", "Ban", "Dismiss"].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleAction(action, report)}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                      action === "Review"
                        ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300"
                        : action === "Warn"
                        ? "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300"
                        : action === "Suspend"
                        ? "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300"
                        : action === "Ban"
                        ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}