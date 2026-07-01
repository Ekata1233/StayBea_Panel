"use client";

import React, { useState } from "react";
import {
  Search,
  X,
  Star,
  User,
  Calendar,
  Clock,
  ThumbsUp,
  MessageCircle,
  Users,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { toast } from "react-toastify";

// ---------- TYPE DEFINITIONS ----------
interface PlanData {
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

// ---------- STATIC DATA ----------
const plansData: PlanData[] = [
  {
    id: 1,
    host: "Sara Khan",
    plan: "Art walk",
    cityArea: "Colaba",
    city: "Mumbai",
    venueWhen: "Today 6 PM",
    venue: "Kala Ghoda, Colaba",
    visibility: "Premium",
    requests: 8,
    status: "Live",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "SK",
    color: "bg-yellow-200",
  },
  {
    id: 2,
    host: "Nisha Verma",
    plan: "Cocktails",
    cityArea: "Koramangala",
    city: "Bangalore",
    venueWhen: "Today 9 PM",
    venue: "Toit, Koramangala",
    visibility: "VIP+",
    requests: 9,
    status: "Live",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "NV",
    color: "bg-indigo-200",
  },
  {
    id: 9,
    host: "Tanya Joshi",
    plan: "Movie",
    cityArea: "Saket",
    city: "Delhi",
    venueWhen: "Today 7 PM",
    venue: "PVR Select Citywalk",
    visibility: "All",
    requests: 3,
    status: "Live",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "TJ",
    color: "bg-teal-200",
  },
  {
    id: 10,
    host: "Dev Sharma",
    plan: "Pizza & chat",
    cityArea: "Bandra",
    city: "Mumbai",
    venueWhen: "Yesterday 8 PM",
    venue: "Pizza Express, Bandra",
    visibility: "Premium",
    requests: 5,
    status: "Completed",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "DS",
    color: "bg-amber-200",
  },
  {
    id: 11,
    host: "Priya Das",
    plan: "Beach evening",
    cityArea: "Panjim",
    city: "Goa",
    venueWhen: "Yesterday 6 PM",
    venue: "Candolim Beach, Goa",
    visibility: "All",
    requests: 6,
    status: "Completed",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "PD",
    color: "bg-cyan-200",
  },
  {
    id: 12,
    host: "Arjun Kapoor",
    plan: "Dinner",
    cityArea: "Baner",
    city: "Pune",
    venueWhen: "Yesterday 9 PM",
    venue: "45 Days, Baner",
    visibility: "VIP+",
    requests: 3,
    status: "Completed",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "AK",
    color: "bg-blue-200",
  },
  {
    id: 13,
    host: "Meera Nair",
    plan: "Movie",
    cityArea: "Saket",
    city: "Delhi",
    venueWhen: "Yesterday 7 PM",
    venue: "PVR Select Citywalk",
    visibility: "All",
    requests: 4,
    status: "Completed",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "MN",
    color: "bg-rose-200",
  },
  {
    id: 14,
    host: "Rohan Mehra",
    plan: "Cafe co-work",
    cityArea: "Indiranagar",
    city: "Bangalore",
    venueWhen: "Yesterday 4 PM",
    venue: "Third Wave, Indiranagar",
    visibility: "All",
    requests: 5,
    status: "Completed",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "RM",
    color: "bg-red-200",
  },
  {
    id: 15,
    host: "Kabir Singh",
    plan: "Ramen night",
    cityArea: "Hauz Khas",
    city: "Delhi",
    venueWhen: "2 days ago",
    venue: "Marmagoto, Hauz Khas",
    visibility: "Premium",
    requests: 7,
    status: "Completed",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "KS",
    color: "bg-orange-200",
  },
  {
    id: 16,
    host: "Chloe Pinto",
    plan: "Rooftop drinks",
    cityArea: "Panjim",
    city: "Goa",
    venueWhen: "3 days ago",
    venue: "Skygarden, Panjim",
    visibility: "All",
    requests: 11,
    status: "Completed",
    profileImage:
      "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
    initials: "CP",
    color: "bg-purple-200",
  },
];

// ---------- MOCK FEEDBACK DATA ----------
interface FeedbackStats {
  avgExperience: number;
  avgPersonRating: number;
  noShowRate: number;
  experienceTags: { tag: string; count: number }[];
  attendance: { status: string; count: number }[];
  reviews: {
    id: number;
    plan: string;
    host: string;
    rating: number;
    comment: string;
    timeAgo: string;
    profileImage?: string | null;
    initials: string;
    color: string;
  }[];
}

const feedbackStats: FeedbackStats = {
  avgExperience: 3.4,
  avgPersonRating: 4.3,
  noShowRate: 40,
  experienceTags: [
    { tag: "Great conversation", count: 2 },
    { tag: "On time", count: 2 },
    { tag: "Respectful", count: 1 },
    { tag: "Good vibe", count: 1 },
    { tag: "Kind", count: 1 },
  ],
  attendance: [
    { status: "Met", count: 7 },
    { status: "No-show", count: 1 },
  ],
  reviews: [
    {
      id: 1,
      plan: "Art walk",
      host: "Sara Khan",
      rating: 5,
      comment: "Lovely evening, would meet again.",
      timeAgo: "Today",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "SK",
      color: "bg-yellow-200",
    },
    {
      id: 2,
      plan: "Cocktails",
      host: "Nisha Verma",
      rating: 4,
      comment: "Nice chat, easy company.",
      timeAgo: "Today",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "NV",
      color: "bg-indigo-200",
    },
    {
      id: 3,
      plan: "Movie",
      host: "Tanya Joshi",
      rating: 4,
      comment: "Really good energy.",
      timeAgo: "Today",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "TJ",
      color: "bg-teal-200",
    },
    {
      id: 4,
      plan: "Pizza & chat",
      host: "Dev Sharma",
      rating: 3,
      comment: "Timing off",
      timeAgo: "Yesterday",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "DS",
      color: "bg-amber-200",
    },
    {
      id: 5,
      plan: "Beach evening",
      host: "Priya Das",
      rating: 2,
      comment: "No one requested",
      timeAgo: "Yesterday",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "PD",
      color: "bg-cyan-200",
    },
    {
      id: 6,
      plan: "Dinner",
      host: "Arjun Kapoor",
      rating: 4,
      comment: "Great conversation",
      timeAgo: "Yesterday",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "AK",
      color: "bg-blue-200",
    },
    {
      id: 7,
      plan: "Movie",
      host: "Meera Nair",
      rating: 3,
      comment: "Person didn't show",
      timeAgo: "Yesterday",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "MN",
      color: "bg-rose-200",
    },
    {
      id: 8,
      plan: "Cafe co-work",
      host: "Rohan Mehra",
      rating: 2,
      comment: "Venue too far",
      timeAgo: "2 days ago",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "RM",
      color: "bg-red-200",
    },
    {
      id: 9,
      plan: "Ramen night",
      host: "Kabir Singh",
      rating: 4,
      comment: "Good vibe",
      timeAgo: "3 days ago",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "KS",
      color: "bg-orange-200",
    },
    {
      id: 10,
      plan: "Rooftop drinks",
      host: "Chloe Pinto",
      rating: 5,
      comment: "Great evening!",
      timeAgo: "3 days ago",
      profileImage:
        "https://ik.imagekit.io/hzyuadmua/date-plan-options/1782559715482-aaa-ChatGPT_Image_Feb_6__2026__04_04_41_PM_y4nyrXQed.png",
      initials: "CP",
      color: "bg-purple-200",
    },
  ],
};

// ---------- COMPONENT ----------
export default function FeedbackTab() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter plans by search
  const filteredPlans = plansData.filter(
    (plan) =>
      searchQuery === "" ||
      plan.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.plan.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter reviews by search
  const filteredReviews = feedbackStats.reviews.filter(
    (review) =>
      searchQuery === "" ||
      review.host.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.plan.toLowerCase().includes(searchQuery.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReviewClick = (review: any) => {
    toast.info(`Viewing review for: ${review.plan} by ${review.host}`);
  };

  return (
    <div>
      {/* ===== FILTER BAR ===== */}
      <div className="mb-6 rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search host, plan or feedback.."
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

      {/* ===== FEEDBACK CARDS ===== */}
      <div className="space-y-4">
        {/* 1. Avg Experience Card */}
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Avg experience
              </span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              {feedbackStats.avgExperience}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {feedbackStats.experienceTags.map((tag, idx) => (
              <span
                key={idx}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {tag.tag} - {tag.count}
              </span>
            ))}
          </div>
        </div>

        {/* 2. Plans List */}
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Plans with feedback
              </span>
            </div>
            <span className="text-sm text-gray-500">{filteredPlans.length} plans</span>
          </div>
          <div className="space-y-3">
            {filteredPlans.slice(0, 5).map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0 dark:border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-8 w-8 flex-shrink-0">
                    {plan.profileImage ? (
                      <Image
                        src={plan.profileImage}
                        alt={plan.host}
                        width={32}
                        height={32}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-full ${plan.color} text-xs font-semibold text-gray-700`}
                      >
                        {plan.initials}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {plan.plan}
                    </div>
                    <div className="text-xs text-gray-500">by {plan.host}</div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">{plan.venueWhen}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Avg Person Rating + Attendance */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Avg person rating
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {feedbackStats.avgPersonRating}
              </span>
            </div>
            <div className="space-y-2">
              {feedbackStats.attendance.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {item.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  No-show rate
                </span>
              </div>
              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                {feedbackStats.noShowRate}%
              </span>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className="h-2 rounded-full bg-red-500"
                style={{ width: `${feedbackStats.noShowRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Reviews List */}
        <div className="rounded-lg bg-white p-5 shadow-sm dark:bg-gray-800">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Reviews
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {filteredReviews.length} reviews
            </span>
          </div>
          <div className="space-y-4">
            {filteredReviews.slice(0, 5).map((review) => (
              <div
                key={review.id}
                className="border-b border-gray-100 pb-4 last:border-0 last:pb-0 dark:border-gray-700"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-10 flex-shrink-0">
                      {review.profileImage ? (
                        <Image
                          src={review.profileImage}
                          alt={review.host}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${review.color} text-sm font-semibold text-gray-700`}
                        >
                          {review.initials}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {review.plan}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        by {review.host} · {review.timeAgo}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleReviewClick(review)}
                    className="rounded-lg p-1.5 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/20"
                    title="View review"
                  >
                    <MessageCircle className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-1 pl-[52px]">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    "{review.comment}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}