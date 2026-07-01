"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import Image from "next/image";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IUser } from "@/types/user";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiShield,
  FiHeart,
  FiUsers,
  FiFlag,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiTrendingUp,
  
} from "react-icons/fi";
import {
  FaVenusMars,
  FaRulerVertical,
  FaUserCheck,
  
} from "react-icons/fa";

interface ExtendedUser extends IUser {
  birth_date?: string;
  gender?: string;
  gender_option?: string;
  height?: number;
  looking_for?: string;
  looking_for_option?: string;
  onboarding_completed?: boolean;
  onboarding_step?: string;
  profile_completion?: number;
  next_step?: string;
  is_phone_verified?: boolean;
  created_at?: string;
  updated_at?: string;
  badge_count?: number;
  hobbies?: string[];
  interests?: string[];
}

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `https://dating-app-backend-plum.vercel.app/api/user/details/${id}`
        );
        const data = await res.json();
        console.log("User Details:", data.data);
        if (data.success) {
          setUser(data.data);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getGenderDisplay = (gender?: string) => {
    if (!gender) return "N/A";
    const genders: Record<string, { label: string; icon: JSX.Element }> = {
      MEN: { label: "Male", icon: <FaVenusMars className="text-blue-400" /> },
      WOMEN: { label: "Female", icon: <FaVenusMars className="text-pink-400" /> },
      OTHER: { label: "Other", icon: <FaVenusMars className="text-purple-400" /> },
    };
    return genders[gender] || { label: gender, icon: null };
  };

  const getLookingForDisplay = (lookingFor?: string) => {
    if (!lookingFor) return "N/A";
    const options: Record<string, string> = {
      DATING: "Dating",
      FRIENDSHIP: "Friendship",
      RELATIONSHIP: "Relationship",
      SHORT_TERM: "Short Term",
      LONG_TERM: "Long Term",
    };
    return options[lookingFor] || lookingFor;
  };

  if (loading) {
    return (
      <DefaultLayout>
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex min-h-[500px] items-center justify-center">
            <div className="text-center">
              <div className="relative mb-6">
                <div className="h-20 w-20 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse"></div>
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Loading Profile</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Please wait while we fetch user details...</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  if (!user) {
    return (
      <DefaultLayout>
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-red-100 p-4 dark:bg-red-900/30">
                  <FiUser className="h-12 w-12 text-red-500" />
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-700 dark:text-gray-300">User Not Found</h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
  The user you&apos;re looking for doesn&apos;t exist or has been removed.
</p>
            </div>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  const genderInfo = getGenderDisplay(user.gender);
  const completionPercentage = Math.min(user.profile_completion || 0, 100);
  const completionColor = completionPercentage > 70 ? 'bg-gradient-to-r from-green-400 to-emerald-500' :
    completionPercentage > 40 ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
      'bg-gradient-to-r from-red-400 to-rose-500';

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">User Profile</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Detailed overview of user information</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90">
              <FiUser className="h-4 w-4" />
              Edit Profile
            </button>
            <button className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
              <FiClock className="h-4 w-4" />
              Activity Log
            </button>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50 shadow-xl dark:from-gray-800 dark:to-gray-900">
          {/* Cover Section */}
          <div className="relative h-56 bg-gradient-to-r from-primary/20 via-primary/5 to-secondary/20">
            <div className="absolute inset-0 bg-[url('/images/cover/cover-01.png')] bg-cover bg-center opacity-30"></div>

            {/* Status Badge - Top Right */}
            <div className="absolute right-6 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-sm dark:bg-gray-900/90">
              <span className={`inline-block h-2 w-2 rounded-full ${user.is_phone_verified ? 'bg-green-500' : 'bg-red-500'}`}></span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {user.is_phone_verified ? 'Verified' : 'Unverified'}
              </span>
            </div>


            {/* Profile Completion & Badges - Left to Right Layout */}
            <div className="absolute bottom-4 left-6 right-6">
              <div className="flex items-center justify-center gap-6">
                {/* Profile Completion */}
                <div className="flex items-center gap-3 flex-1 max-w-[600px]">
                  <div className="flex items-center gap-2 min-w-fit">
                    <FiTrendingUp className="h-4 w-4 text-white" />
                    <span className="text-xs font-medium text-white/90 whitespace-nowrap">Completion</span>
                  </div>
                  <div className="flex-1 min-w-[100px]">
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/30 backdrop-blur-sm">
                      <div
                        className={`h-full rounded-full ${completionColor} transition-all duration-1000 ease-out`}
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-white min-w-[40px] text-right">
                    {completionPercentage}%
                  </span>
                </div>

                {/* Divider */}
                <div className="h-8 w-px bg-white/30"></div>

               
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-8">
            {/* Avatar */}
            <div className="relative -mt-16 flex items-end gap-6">
              <div className="relative">
                <div className="h-28 w-28 rounded-2xl border-4 border-white bg-gradient-to-br from-primary/20 to-secondary/20 p-1 shadow-xl dark:border-gray-800">
                  {user.profile_picture ? (
                    <Image
                      src={user.profile_picture}
                      width={112}
                      height={112}
                      className="h-full w-full rounded-xl object-cover"
                      alt="profile"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-3xl font-bold text-white">
                      {getInitials(user.full_name)}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 rounded-full bg-green-500 p-1.5 ring-2 ring-white dark:ring-gray-800">
                  <div className="h-2 w-2 rounded-full bg-green-400"></div>
                </div>
              </div>

              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                    {user.full_name || "Unnamed User"}
                  </h2>
                  {user.onboarding_completed && (
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
                      <FiCheckCircle className="mr-1 inline h-3 w-3" />
                      Complete
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <FiMail className="h-3.5 w-3.5" />
                    {user.email || "No email"}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1">
                    <FiPhone className="h-3.5 w-3.5" />
                    {user.phone_number || "N/A"}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-gray-300"></span>
                  <span className="flex items-center gap-1">
                    <FiCalendar className="h-3.5 w-3.5" />
                    Joined {formatDate(user.created_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50 p-4 dark:from-blue-900/20 dark:to-blue-800/10">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-blue-500/10 p-2">
                    <FaVenusMars className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Gender</p>
                    <p className="font-semibold text-gray-800 dark:text-white">{genderInfo.label}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100/50 p-4 dark:from-purple-900/20 dark:to-purple-800/10">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-purple-500/10 p-2">
                    <FaRulerVertical className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Height</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {user.height ? `${user.height} cm` : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-pink-50 to-pink-100/50 p-4 dark:from-pink-900/20 dark:to-pink-800/10">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-pink-500/10 p-2">
                    <FiHeart className="h-5 w-5 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Looking For</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {getLookingForDisplay(user.looking_for)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100/50 p-4 dark:from-green-900/20 dark:to-green-800/10">
                <div className="flex items-center gap-2">
                  <div className="rounded-lg bg-green-500/10 p-2">
                    <FiShield className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
                    <p className="font-semibold text-gray-800 dark:text-white">
                      {user.is_phone_verified ? "Verified" : "Unverified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Information */}
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* Left Column - Personal Details */}
              <div className="lg:col-span-2">
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                    <FiUser className="h-5 w-5 text-primary" />
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Full Name</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white">{user.full_name || "N/A"}</p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Birth Date</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white">{formatDate(user.birth_date)}</p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Gender</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white">{genderInfo.label}</p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Gender Preference</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white">{user.gender_option || "N/A"}</p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Height</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white">
                        {user.height ? `${user.height} cm` : "N/A"}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Looking For</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white">
                        {getLookingForDisplay(user.looking_for)}
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Looking For Option</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white">{user.looking_for_option || "N/A"}</p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-700/30">
                      <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">Phone Verified</p>
                      <p className="mt-1 font-medium text-gray-800 dark:text-white">
                        {user.is_phone_verified ? (
                          <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                            <FiCheckCircle className="h-4 w-4" /> Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                            <FiXCircle className="h-4 w-4" /> Not Verified
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Status & Activity */}
              <div className="space-y-6">
                {/* Onboarding Status */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
                    <FaUserCheck className="h-5 w-5 text-primary" />
                    Onboarding Status
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Step</span>
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        {user.onboarding_step || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Next Step</span>
                      <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                        {user.next_step || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <span className={`rounded-full px-3 py-1 text-sm font-medium ${user.onboarding_completed
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                        {user.onboarding_completed ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                  </div>
                </div>

               

                {/* Quick Actions */}
                <div className="rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800/50">
                  <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Quick Actions</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button className="rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:bg-primary/20 dark:bg-primary/20 dark:hover:bg-primary/30">
                      <FiMail className="mr-2 inline h-4 w-4" />
                      Message
                    </button>
                    <button className="rounded-lg bg-green-500/10 px-4 py-2 text-sm font-medium text-green-600 transition hover:bg-green-500/20 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30">
                      <FiUsers className="mr-2 inline h-4 w-4" />
                      Block
                    </button>
                    <button className="rounded-lg bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-600 transition hover:bg-yellow-500/20 dark:bg-yellow-500/20 dark:text-yellow-400 dark:hover:bg-yellow-500/30">
                      <FiFlag className="mr-2 inline h-4 w-4" />
                      Report
                    </button>
                    <button className="rounded-lg bg-red-500/10 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30">
                      <FiUser className="mr-2 inline h-4 w-4" />
                      Suspend
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Info */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <FiClock className="h-4 w-4" />
                  Created: {formatDate(user.created_at)}
                </span>
                <span className="hidden h-4 w-px bg-gray-300 dark:bg-gray-600 md:block"></span>
                <span className="flex items-center gap-1">
                  <FiClock className="h-4 w-4" />
                  Updated: {formatDate(user.updated_at)}
                </span>
                {user.deleted_at && (
                  <>
                    <span className="hidden h-4 w-px bg-gray-300 dark:bg-gray-600 md:block"></span>
                    <span className="flex items-center gap-1 text-red-500">
                      <FiXCircle className="h-4 w-4" />
                      Deleted: {formatDate(user.deleted_at)}
                    </span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 dark:text-gray-500">ID:</span>
                <code className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                  {user.id?.slice(0, 8)}...{user.id?.slice(-8)}
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default UserDetails;