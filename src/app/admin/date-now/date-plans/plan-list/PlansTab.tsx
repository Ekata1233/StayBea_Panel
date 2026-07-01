"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import GenericTable from "@/components/ui/GenericTable";
import {
  Search,
  ChevronDown,
  X,
  Eye,
  Filter,
  MapPin,
  Building2,
} from "lucide-react";
import Image from "next/image";
import { useDateNow, DatePlan } from "@/context/DateNowContext";

// ---------- TYPE DEFINITIONS ----------
interface PlanData {
  id: string;
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

// ---------- MAPPING HELPER ----------
function mapApiPlanToPlanData(apiPlan: DatePlan, index: number): PlanData {
  const hostName = apiPlan.host.name;
  const initials = hostName
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    "bg-pink-200",
    "bg-blue-200",
    "bg-purple-200",
    "bg-green-200",
    "bg-yellow-200",
    "bg-red-200",
    "bg-indigo-200",
    "bg-orange-200",
  ];
  const color = colors[index % colors.length];

  const date = new Date(apiPlan.venueWhen);
  const formattedDate = date.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  return {
    id: apiPlan.id,
    host: hostName,
    plan: apiPlan.plan,
    cityArea: apiPlan.cityArea,
    city: apiPlan.city,
    venue: apiPlan.venue,
    venueWhen: formattedDate,
    visibility: apiPlan.visibility,
    requests: apiPlan.requests,
    status: apiPlan.status,
    profileImage: apiPlan.host.profileImage || null,
    initials,
    color,
  };
}

// ---------- STATUS OPTIONS ----------
const statuses = ["All Status", "Live", "Upcoming", "Completed", "Cancelled"];

// ---------- COMPONENT ----------
export default function PlansTab() {
  const router = useRouter();
  const { plans, loading, getPlans, filterData } = useDateNow();
  const { setSelectedPlanId } = useDateNow();
  // ---------- FILTER STATE ----------
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedCityArea, setSelectedCityArea] = useState("All City Areas");
  const [selectedVenue, setSelectedVenue] = useState("All Venues");
  const [selectedStatus, setSelectedStatus] = useState("All Status");

  // ---------- DROPDOWN STATES ----------
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isCityAreaOpen, setIsCityAreaOpen] = useState(false);
  const [isVenueOpen, setIsVenueOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);

  // ---------- FETCH PLANS ON MOUNT ----------
  useEffect(() => {
    getPlans();
  }, [getPlans]);

  // ---------- DERIVED FILTER DATA ----------
  const cities = useMemo(() => {
    return ["All Cities", ...(filterData.cities || [])];
  }, [filterData.cities]);

  const cityAreas = useMemo(() => {
    return ["All City Areas", ...(filterData.cityAreas || [])];
  }, [filterData.cityAreas]);

  const venues = useMemo(() => {
    return ["All Venues", ...(filterData.venues || [])];
  }, [filterData.venues]);

  // Filter city areas based on selected city
  const availableCityAreas = useMemo(() => {
    if (selectedCity !== "All Cities") {
      // Filter city areas that belong to the selected city
      const filtered = cityAreas.filter((area) => {
        if (area === "All City Areas") return true;
        return plans.some(
          (plan) => plan.city === selectedCity && plan.cityArea === area,
        );
      });
      return filtered.length > 1 ? filtered : ["All City Areas"];
    }
    return cityAreas;
  }, [selectedCity, cityAreas, plans]);

  // Filter venues based on selected city area
  const availableVenues = useMemo(() => {
    if (selectedCityArea !== "All City Areas") {
      // Filter venues that belong to the selected city area
      const filtered = venues.filter((venue) => {
        if (venue === "All Venues") return true;
        return plans.some(
          (plan) => plan.cityArea === selectedCityArea && plan.venue === venue,
        );
      });
      return filtered.length > 1 ? filtered : ["All Venues"];
    }
    if (selectedCity !== "All Cities") {
      // Filter venues that belong to the selected city
      const filtered = venues.filter((venue) => {
        if (venue === "All Venues") return true;
        return plans.some(
          (plan) => plan.city === selectedCity && plan.venue === venue,
        );
      });
      return filtered.length > 1 ? filtered : ["All Venues"];
    }
    return venues;
  }, [selectedCityArea, selectedCity, venues, plans]);

  // ---------- MAP PLANS ----------
  const mappedPlans: PlanData[] = (plans || []).map((apiPlan, index) =>
    mapApiPlanToPlanData(apiPlan, index),
  );

  // ---------- FILTER LOGIC ----------
  const filteredPlans = mappedPlans.filter((plan) => {
    const matchesCity =
      selectedCity === "All Cities" || plan.city === selectedCity;
    const matchesCityArea =
      selectedCityArea === "All City Areas" ||
      plan.cityArea === selectedCityArea;
    const matchesVenue =
      selectedVenue === "All Venues" || plan.venue === selectedVenue;
    const matchesStatus =
      selectedStatus === "All Status" || plan.status === selectedStatus;
    const matchesSearch =
      searchQuery === "" ||
      plan.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.venue.toLowerCase().includes(searchQuery.toLowerCase());

    return (
      matchesCity &&
      matchesCityArea &&
      matchesVenue &&
      matchesStatus &&
      matchesSearch
    );
  });

  // ---------- CLEAR FILTERS ----------
  const clearFilters = () => {
    setSelectedCity("All Cities");
    setSelectedCityArea("All City Areas");
    setSelectedVenue("All Venues");
    setSelectedStatus("All Status");
    setSearchQuery("");
  };

  // Count active filters
  const activeFilterCount = [
    selectedCity !== "All Cities",
    selectedCityArea !== "All City Areas",
    selectedVenue !== "All Venues",
    selectedStatus !== "All Status",
    searchQuery,
  ].filter(Boolean).length;

  // ---------- HANDLERS ----------
  const handleView = (plan: PlanData) => {
    console.log("Selected Plan:", plan);
    console.log("Plan ID:", plan.id);
    setSelectedPlanId(plan.id);
    router.push(`/admin/date-now/date-plans/plan-list/${plan.id}`);
  };

  // ---------- RENDER DROPDOWN COMPONENT ----------
  const renderDropdown = ({
    isOpen,
    setIsOpen,
    value,
    setValue,
    options,
    placeholder,
    icon: Icon,
  }: {
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    value: string;
    setValue: (value: string) => void;
    options: string[];
    placeholder: string;
    icon?: React.ElementType;
  }) => (
    <div className="relative min-w-[140px] flex-1">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      >
        <span className="flex items-center gap-2 truncate">
          {Icon && <Icon className="h-4 w-4 flex-shrink-0 text-gray-400" />}
          <span className="truncate">{value}</span>
        </span>
        <ChevronDown className="h-4 w-4 flex-shrink-0 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full min-w-[180px] overflow-y-auto rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-700">
          <div className="py-1">
            {options.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No options available
              </div>
            ) : (
              options.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setValue(option);
                    setIsOpen(false);
                  }}
                  className={`block w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    value === option
                      ? "bg-blue-50 text-[#1877f2] dark:bg-blue-900/20 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  {option}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );

  // ---------- TABLE COLUMNS ----------
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
                onError={(e) =>
                  ((e.target as HTMLImageElement).style.display = "none")
                }
              />
            ) : null}
            <div
              className={`fallback-avatar flex h-10 w-10 items-center justify-center rounded-full ${row.color} text-sm font-semibold text-gray-700 ${
                row.profileImage ? "hidden" : ""
              }`}
            >
              {row.initials}
            </div>
          </div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {row.host}
          </span>
        </div>
      ),
    },
    {
      header: "PLAN",
      accessor: "plan",
      width: "150px",
      align: "left" as const,
      render: (row: PlanData) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.plan}
        </span>
      ),
    },
    {
      header: "CITY-AREA",
      accessor: "cityArea",
      width: "150px",
      align: "left" as const,
      render: (row: PlanData) => (
        <div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.cityArea}
          </span>
          <span className="ml-1 text-xs text-gray-400">({row.city})</span>
        </div>
      ),
    },
    {
      header: "VENUE-WHEN",
      accessor: "venue",
      width: "200px",
      align: "left" as const,
      render: (row: PlanData) => (
        <div>
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {row.venue}
          </div>
          <div className="text-xs text-gray-400">{row.venueWhen}</div>
        </div>
      ),
    },
    {
      header: "VISIBILITY",
      accessor: "visibility",
      width: "100px",
      align: "left" as const,
      render: (row: PlanData) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            row.visibility === "VIP+"
              ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300"
              : row.visibility === "Premium"
                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
          }`}
        >
          {row.visibility}
        </span>
      ),
    },
    {
      header: "REQUESTS",
      accessor: "requests",
      width: "100px",
      align: "center" as const,
      render: (row: PlanData) => (
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {row.requests} requests
        </span>
      ),
    },
    {
      header: "STATUS",
      accessor: "status",
      width: "100px",
      align: "left" as const,
      render: (row: PlanData) => (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span>
          {row.status}
        </span>
      ),
    },
    {
      header: "ACTIONS",
      accessor: "actions",
      width: "120px",
      align: "center" as const,
      render: (row: PlanData) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="rounded-lg p-2 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20"
            title="View plan details"
          >
            <Eye size={18} />
          </button>
        </div>
      ),
    },
  ];

  // ---------- LOADING STATE ----------
  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading plans…
          </p>
        </div>
      </div>
    );
  }

  // ---------- RENDER ----------
  return (
    <div>
      {/* ===== FILTER BAR ===== */}
      <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
        {/* Filter Header */}
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-500" />
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filters
            </h3>
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {activeFilterCount} active
              </span>
            )}
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
              Clear all
            </button>
          )}
        </div>

        {/* 5 Filters in 1 Row */}
        <div className="flex flex-wrap items-center gap-3">
          {/* City */}
          {renderDropdown({
            isOpen: isCityOpen,
            setIsOpen: setIsCityOpen,
            value: selectedCity,
            setValue: setSelectedCity,
            options: cities,
            placeholder: "All Cities",
            icon: MapPin,
          })}

          {/* City Area */}
          {renderDropdown({
            isOpen: isCityAreaOpen,
            setIsOpen: setIsCityAreaOpen,
            value: selectedCityArea,
            setValue: setSelectedCityArea,
            options: availableCityAreas,
            placeholder: "All City Areas",
            icon: MapPin,
          })}

          {/* Venue */}
          {renderDropdown({
            isOpen: isVenueOpen,
            setIsOpen: setIsVenueOpen,
            value: selectedVenue,
            setValue: setSelectedVenue,
            options: availableVenues,
            placeholder: "All Venues",
            icon: Building2,
          })}

          {/* Status */}
          {renderDropdown({
            isOpen: isStatusOpen,
            setIsOpen: setIsStatusOpen,
            value: selectedStatus,
            setValue: setSelectedStatus,
            options: statuses,
            placeholder: "Status",
          })}

          {/* Search */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search host, plan or venue.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-gray-50 py-2 pl-9 pr-4 text-sm focus:border-[#1877f2] focus:outline-none focus:ring-1 focus:ring-[#1877f2] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>

        {/* Active Filter Badges */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
          {selectedCity !== "All Cities" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/30 dark:text-green-300">
              🏙️ {selectedCity}
              <button
                onClick={() => setSelectedCity("All Cities")}
                className="ml-1 hover:text-green-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedCityArea !== "All City Areas" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
              📍 {selectedCityArea}
              <button
                onClick={() => setSelectedCityArea("All City Areas")}
                className="ml-1 hover:text-yellow-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedVenue !== "All Venues" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
              🏢 {selectedVenue}
              <button
                onClick={() => setSelectedVenue("All Venues")}
                className="ml-1 hover:text-purple-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {selectedStatus !== "All Status" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              {selectedStatus}
              <button
                onClick={() => setSelectedStatus("All Status")}
                className="ml-1 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          {searchQuery && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-800 dark:bg-gray-700 dark:text-gray-300">
              Search: "{searchQuery}"
              <button
                onClick={() => setSearchQuery("")}
                className="ml-1 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      </div>

      {/* ===== TABLE ===== */}
      <GenericTable
        title={`Date Plans (${filteredPlans.length} of ${mappedPlans.length})`}
        columns={columns}
        data={filteredPlans}
        showActions={true}
        showView={false}
        showEdit={false}
        showDelete={false}
        onRowClick={(row) => handleView(row as PlanData)}
      />

      {/* Show message when no plans found */}
      {!loading && mappedPlans.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-gray-500 dark:text-gray-400">No plans available</p>
          <button
            onClick={() => getPlans()}
            className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
