// context/DateNowContext.tsx
"use client";

import { API_BASE_URL } from "@/utils/api";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from "react";

// Detailed Date Plan interface matching your API response
export interface DatePlanDetail {
  id: string;
  host: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  activity: {
    label: string;
    icon: string;
  };
  title: string | null;
  quickTitle: {
    label: string;
    icon: string;
  };
  note: string;
  photoUrl: string;
  venueName: string;
  venueAddress: string;
  venueLat: number;
  venueLng: number;
  duration: number;
  participantLimit: number;
  status: string;
  eventDateTime: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  whoPays: {
    label: string;
  };
  joinRequestGender: {
    label: string;
  };
  visibility: {
    label: string;
  };
  vibes: string[];
  totalRequests: number;
  requests: Array<{
    id: string;
    status: string;
    message: string | null;
    createdAt: string;
    requester: {
      id: string;
      name: string | null;
      profileImage: string | null;
    };
  }>;
  confirmedDate: {
    id: string;
    planId: string;
    hostUserId: string;
    participantId: string;
    title: string | null;
    venueName: string;
    venueAddress: string;
    eventDateTime: string;
    status: string;
    createdAt: string;
    updatedAt: string;
  } | null;
}

// For list view - simplified version
export interface DatePlan {
  id: string;
  host: {
    id: string;
    name: string;
    profileImage: string | null;
  };
  plan: string;
  cityArea: string;
  city: string;
  venue: string;
  venueWhen: string;
  visibility: string;
  requests: number;
  status: string;
}

// Filter data structure
export interface FilterData {
  cities: string[];
  cityAreas: string[];
  venues: string[];
}

// Stats interface
export interface DateNowStats {
  activeNow: number;
  plansToday: number;
}

interface DateNowContextType {
  plans: DatePlan[];
  currentPlan: DatePlanDetail | null;
  loading: boolean;
  error: string | null;
  filterData: FilterData;
  stats: DateNowStats;
  getPlans: () => Promise<void>;
  getPlanDetail: (planId: string) => Promise<DatePlanDetail | null>;
  fetchFilterData: () => Promise<void>;
   selectedPlanId: string | null;
  setSelectedPlanId: (id: string | null) => void;
}

const DateNowContext = createContext<DateNowContextType | undefined>(
  undefined
);

export const DateNowProvider = ({ children }: { children: ReactNode }) => {
  const [plans, setPlans] = useState<DatePlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<DatePlanDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterData, setFilterData] = useState<FilterData>({
    cities: [],
    cityAreas: [],
    venues: [],
  });
  const [stats, setStats] = useState<DateNowStats>({
    activeNow: 0,
    plansToday: 0,
  });
const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  // Calculate stats from plans data
  const calculateStats = useCallback((plansData: DatePlan[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let activeNow = 0;
    let plansToday = 0;

    plansData.forEach((plan) => {
      const venueDate = new Date(plan.venueWhen);
      const isToday = venueDate >= today && venueDate < tomorrow;
      const isActive = plan.status === "ACTIVE";

      // Count active now (status = ACTIVE)
      if (isActive) {
        activeNow++;
      }

      // Count plans today (regardless of status)
      if (isToday) {
        plansToday++;
      }
    });

    setStats({
      activeNow,
      plansToday,
    });
  }, []);

  const getPlans = useCallback(async () => {
    const url = `${API_BASE_URL}/api/admin/date-now/date-plans`;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        const plansData = result.data || [];
        setPlans(plansData);
        extractFilterData(plansData);
        calculateStats(plansData);
      } else {
        setPlans([]);
        setError(result.message || "Failed to fetch plans");
        setStats({ activeNow: 0, plansToday: 0 });
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setPlans([]);
      setError(err instanceof Error ? err.message : "Failed to load plans");
      setStats({ activeNow: 0, plansToday: 0 });
    } finally {
      setLoading(false);
    }
  }, [calculateStats]);

  // New method to fetch a specific plan detail
  const getPlanDetail = useCallback(async (planId: string): Promise<DatePlanDetail | null> => {
    const url = `${API_BASE_URL}/api/admin/date-now/date-plans/${planId}`;
    
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setCurrentPlan(result.data);
        return result.data;
      } else {
        setError(result.message || "Failed to fetch plan detail");
        return null;
      }
    } catch (err) {
      console.error("❌ Fetch error:", err);
      setError(err instanceof Error ? err.message : "Failed to load plan detail");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Extract unique filter values from plans
  const extractFilterData = (plansData: DatePlan[]) => {
    const cities = new Set<string>();
    const cityAreas = new Set<string>();
    const venues = new Set<string>();

    plansData.forEach((plan) => {
      if (plan.city) cities.add(plan.city);
      if (plan.cityArea) cityAreas.add(plan.cityArea);
      if (plan.venue) venues.add(plan.venue);
    });

    setFilterData({
      cities: Array.from(cities).sort(),
      cityAreas: Array.from(cityAreas).sort(),
      venues: Array.from(venues).sort(),
    });
  };

  const fetchFilterData = useCallback(async () => {
    if (plans.length > 0) {
      extractFilterData(plans);
    }
  }, [plans]);

  // Initial fetch
  useEffect(() => {
    getPlans();
  }, [getPlans]);

  return (
    <DateNowContext.Provider
      value={{
        plans,
        currentPlan,
        loading,
        error,
        filterData,
        stats,
        getPlans,
        getPlanDetail,
        fetchFilterData,
         selectedPlanId,
    setSelectedPlanId,
      }}
    >
      {children}
    </DateNowContext.Provider>
  );
};

export const useDateNow = () => {
  const context = useContext(DateNowContext);
  if (!context) {
    throw new Error("useDateNow must be used within DateNowProvider");
  }
  return context;
};