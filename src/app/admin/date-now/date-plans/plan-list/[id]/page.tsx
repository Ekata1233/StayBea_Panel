"use client";

import DefaultLayout from '@/components/Layouts/DefaultLayout';
import React, { useEffect, useState } from 'react';
import { useDateNow, DatePlanDetail } from '@/context/DateNowContext';
import {
  Search,
  Bell,
  HelpCircle,
  ChevronLeft,
  Coffee,
  Star,
  Square,
  Flag,
  Trash2,
  BadgeCheck,
  MapPin,
  Calendar,
  Users,
  Clock,
} from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

function Page() {
  const { currentPlan, loading, error, getPlanDetail } = useDateNow();
const params = useParams();
const planId = params.id as string;

  useEffect(() => {
   if (planId) {
    getPlanDetail(planId);
  }
  }, [planId, getPlanDetail]);

  // Handle loading state
  if (loading) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-[#f6f5f1] p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading plan details...</p>
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-[#f6f5f1] p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
            Error: {error}
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Handle no data
  if (!currentPlan) {
    return (
      <DefaultLayout>
        <div className="min-h-screen bg-[#f6f5f1] p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
            No plan details found
          </div>
        </div>
      </DefaultLayout>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calculate time ago
  const timeAgo = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch(status?.toUpperCase()) {
      case 'BOOKED': return 'bg-green-50 text-green-700';
      case 'PENDING': return 'bg-yellow-50 text-yellow-700';
      case 'DECLINED': return 'bg-red-50 text-red-700';
      case 'UPCOMING': return 'bg-blue-50 text-blue-700';
      case 'COMPLETED': return 'bg-gray-50 text-gray-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // Build meta data from API response
  const meta = [
    { label: 'Venue (Public)', value: currentPlan.venueName },
    { label: 'When', value: formatDate(currentPlan.eventDateTime) },
    { label: 'City · Area', value: currentPlan.venueAddress },
    { label: 'Who Pays', value: currentPlan.whoPays?.label || 'Not specified' },
    { label: 'Group', value: `${currentPlan.participantLimit} · ${currentPlan.participantLimit} spot${currentPlan.participantLimit > 1 ? 's' : ''}` },
    { label: 'Can Request', value: currentPlan.joinRequestGender?.label || 'All' },
    { label: 'Vibe', value: currentPlan.vibes?.length > 0 ? currentPlan.vibes.join(', ') : 'Not specified' },
    { label: 'Visibility', value: currentPlan.visibility?.label || 'Public' },
  ];

  // Format join requests from API
  const joinRequests = currentPlan.requests?.map(req => ({
    image: req.requester.profileImage || '/default-avatar.png',
    name: req.requester.name || 'Anonymous User',
    pct: '92%', // You might want to calculate this from your data
    note: req.message || 'No message provided',
    status: req.status,
  })) || [];

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-[#f6f5f1] p-6 font-sans">
        {/* ── Top bar ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white">
              {currentPlan.activity?.icon && (
                    <img src={currentPlan.activity.icon} alt="" className="h-5 w-5" />
                  )}
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight text-gray-900">
                {currentPlan.activity?.label || 'Date Plan'}
              </h1>
              <p className="text-xs text-gray-500">
                <span className="font-medium text-rose-500">Date Now</span> · {currentPlan.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users, IDs, transactions…"
                className="w-72 rounded-full border border-gray-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-200"
              />
            </div>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <Bell className="h-4 w-4 text-gray-600" />
            </button>
            <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white">
              <HelpCircle className="h-4 w-4 text-gray-600" />
            </button>
          </div>
        </div>

        {/* ── Breadcrumb ──────────────────────────────────────────── */}
        <div className="mb-5 flex items-center gap-3">
          <button className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700">
            <ChevronLeft className="h-4 w-4" />
            Back to Date Now
          </button>
          <span className="text-sm text-gray-400">
            Date Now / {currentPlan.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        {/* ── Content ─────────────────────────────────────────────── */}
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Left: main card */}
          <div className="flex-1 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Plan header */}
            <div className="flex items-start gap-4">
              <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200">
                <Image
                  src={currentPlan.host.profileImage || '/default-avatar.png'}
                  alt={currentPlan.host.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {currentPlan.activity?.icon && (
                    <img src={currentPlan.activity.icon} alt="" className="h-5 w-5" />
                  )}
                  <h2 className="text-xl font-bold text-gray-900">
                    {currentPlan.title || currentPlan.activity?.label || 'Date Plan'}
                  </h2>
                  <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${getStatusColor(currentPlan.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      currentPlan.status === 'BOOKED' ? 'bg-green-500' :
                      currentPlan.status === 'UPCOMING' ? 'bg-blue-500' : 'bg-gray-500'
                    }`} />
                    {currentPlan.status}
                  </span>
                  {currentPlan.confirmedDate && (
                    <span className="flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700">
                      <BadgeCheck className="h-3 w-3" />
                      Confirmed
                    </span>
                  )}
                </div>
                <p className="mt-0.5 text-sm text-gray-600">
                  Hosted by <span className="font-semibold text-gray-800">{currentPlan.host.name}</span> · posted {timeAgo(currentPlan.createdAt)}
                </p>
              </div>
            </div>

            {/* Description / Note */}
            {currentPlan.note && (
              <p className="mt-4 text-sm text-gray-600">
                "{currentPlan.note}"
              </p>
            )}

            {/* Photo if available */}
            {currentPlan.photoUrl && (
              <div className="mt-4 relative h-48 w-full rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={currentPlan.photoUrl}
                  alt={currentPlan.venueName}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <hr className="my-5 border-gray-100" />

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
              {meta.map((m) => (
                <div key={m.label}>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                    {m.label}
                  </p>
                  <p className="mt-1 font-medium text-gray-800">{m.value}</p>
                </div>
              ))}
              {/* Duration */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Duration
                </p>
                <p className="mt-1 font-medium text-gray-800">{currentPlan.duration} hours</p>
              </div>
            </div>

            <hr className="my-5 border-gray-100" />

            {/* Join requests */}
            <h3 className="mb-3 text-base font-bold text-gray-900">
              Join requests · {currentPlan.totalRequests || currentPlan.requests?.length || 0}
            </h3>
            <div className="space-y-3">
              {joinRequests.length > 0 ? (
                joinRequests.map((r, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200">
                        <Image
                          src={r.image}
                          alt={r.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-gray-900">{r.name}</span>
                          <BadgeCheck className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-semibold text-purple-600">{r.pct}</span>
                        </div>
                        {r.note && (
                          <p className="text-sm text-gray-500">{r.note}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No join requests yet</p>
              )}
            </div>

            {/* Confirmed Date Info */}
            {currentPlan.confirmedDate && (
              <>
                <hr className="my-5 border-gray-100" />
                <div>
                  <h3 className="mb-3 text-base font-bold text-gray-900">Confirmed Date</h3>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Venue</p>
                        <p className="font-medium text-gray-800">{currentPlan.confirmedDate.venueName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Location</p>
                        <p className="font-medium text-gray-800">{currentPlan.confirmedDate.venueAddress}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Date & Time</p>
                        <p className="font-medium text-gray-800">{formatDate(currentPlan.confirmedDate.eventDateTime)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Status</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(currentPlan.confirmedDate.status)}`}>
                          {currentPlan.confirmedDate.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right: admin actions */}
          <div className="w-full shrink-0 lg:w-80">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-base font-bold text-gray-900">Admin actions</h3>
              <div className="space-y-3">
                <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  Feature / boost plan
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                  <Square className="h-4 w-4 fill-gray-800 text-gray-800" />
                  Force-end plan
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-4 py-3 text-left text-sm font-medium text-gray-800 hover:bg-gray-50 transition-colors">
                  <Flag className="h-4 w-4 text-red-500" />
                  Flag for review
                </button>
                <button className="flex w-full items-center gap-2 rounded-lg bg-red-500 px-4 py-3 text-left text-sm font-medium text-white hover:bg-red-600 transition-colors">
                  <Trash2 className="h-4 w-4" />
                  Take down (notify host)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}

export default Page;