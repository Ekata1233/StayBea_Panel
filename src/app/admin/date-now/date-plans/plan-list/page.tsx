// app/dashboard/admin/date-now/page.tsx
"use client";

import React, { useState } from "react";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Calendar, Flag, Star, Settings } from "lucide-react";
import { useDateNow } from "@/context/DateNowContext";

// Import the 4 tab components
import PlansTab from "./PlansTab";
import ReportsTab from "./ReportsTab";
import FeedbackTab from "./FeedbackTab";
import PlanSetupTab from "./PlanSetupTab";

// ---------- STATIC DATA (will be replaced by API later) ----------
export interface PlanData {
  id: number;
  host: string;
  plan: string;
  cityArea: string;
  city: string;
  venueWhen: string;
  venue: string;
  visibility: string;
  requests: number;
  status: string;
  profileImage?: string | null;
  initials: string;
  color: string;
}

export interface ReportData {
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
  profileImage?: string | null;
  initials: string;
  color: string;
}

const plansData: PlanData[] = [
  // ... (copy your full plansData array here)
];

const reportsData: ReportData[] = [
  // ... (copy your full reportsData array here)
];

type ActiveTab = "plans" | "reports" | "feedback" | "plansetup";

export default function DatePlanListPage() {
  const { stats, plans, loading } = useDateNow();
  const [activeTab, setActiveTab] = useState<ActiveTab>("plans");

  // Calculate stats from context
  const statsDisplay = [
    { label: "Active now", value: stats.activeNow },
    { label: "Plans today", value: stats.plansToday },
    { label: "Pending requests", value: "-" },
    { label: "Approval rate", value: "-" },
    { label: "Open reports", value: "-" },
    { label: "Avg date rating", value: "-" },
  ];

  const tabs = [
    { id: "plans" as const, label: "Plans", icon: Calendar, badge: null },
    { id: "reports" as const, label: "Reports & safety", icon: Flag, badge: reportsData.length },
    { id: "feedback" as const, label: "Feedback", icon: Star, badge: null },
    { id: "plansetup" as const, label: "Plan setup", icon: Settings, badge: null },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "plans":
        return <PlansTab plans={plans as any} />;
      case "reports":
        return <ReportsTab reports={reportsData} />;
      case "feedback":
        return <FeedbackTab plans={plans as any} />;
      case "plansetup":
        return <PlanSetupTab plans={plans as any} />;
      default:
        return null;
    }
  };

  return (
    <DefaultLayout>
      <ToastContainer theme="colored" />
      <div className="min-h-screen bg-[#f0f2f5] p-4 dark:bg-gray-900 md:p-6 lg:p-8">
        <div className="max-w-8xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Date Now</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {activeTab === "reports"
                  ? "Reports & Safety"
                  : activeTab === "feedback"
                  ? "User Feedback"
                  : activeTab === "plansetup"
                  ? "Plan Setup Management"
                  : "Live plans & requests"}
              </p>
            </div>
            {loading && (
              <div className="mt-2 md:mt-0">
                <span className="text-sm text-gray-500">Loading...</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {statsDisplay.map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-800"
              >
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Tab Buttons */}
          <div className="mb-6 flex flex-wrap items-center gap-3">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all duration-200 ${
                    isActive
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.badge !== null && (
                    <span className="ml-1 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {renderContent()}
        </div>
      </div>
    </DefaultLayout>
  );
}