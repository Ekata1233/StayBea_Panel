// components/gifts/GiftsData.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* ================= TYPES ================= */

export interface TopGift {
  rank: number;
  icon: string;
  name: string;
  category: string;
  coins: number;
  sent: string;
  revenue: string;
}

export interface GiftUser {
  rank: number;
  name: string;
  city: string;
  plan: "FREE" | "PREMIUM" | "VIP" | "ELITE";
  count: number;
  coins: number;
  avatarColor: string;
}

/* ================= DATA (baad mein API se replace hoga) ================= */

export const topGifts: TopGift[] = [
  { rank: 1, icon: "🌹", name: "Rose", category: "Engagement", coins: 50, sent: "12.4k", revenue: "₹6.21L" },
  { rank: 2, icon: "💝", name: "Compliment", category: "Engagement", coins: 30, sent: "8.1k", revenue: "₹2.44L" },
  { rank: 3, icon: "🚀", name: "Boost · 30 min", category: "Visibility", coins: 300, sent: "5.6k", revenue: "₹16.80L" },
  { rank: 4, icon: "☕", name: "Coffee gift", category: "Gift", coins: 80, sent: "3.2k", revenue: "₹2.57L" },
  { rank: 5, icon: "🍫", name: "Chocolate Box", category: "Gift", coins: 120, sent: "2.2k", revenue: "₹2.69L" },
];

export const receiversData: GiftUser[] = [
  { rank: 1, name: "Kabir Singh", city: "Delhi", plan: "ELITE", count: 146, coins: 18688, avatarColor: "bg-indigo-500" },
  { rank: 2, name: "Elena Dsouza", city: "Bengaluru", plan: "FREE", count: 113, coins: 11978, avatarColor: "bg-rose-500" },
  { rank: 3, name: "Aanya Mehta", city: "Pune", plan: "VIP", count: 89, coins: 8099, avatarColor: "bg-emerald-500" },
  { rank: 4, name: "Chloe Pinto", city: "Goa", plan: "PREMIUM", count: 76, coins: 6308, avatarColor: "bg-amber-500" },
  { rank: 5, name: "Shraddha Rao", city: "Pune", plan: "FREE", count: 70, coins: 5530, avatarColor: "bg-sky-500" },
  { rank: 6, name: "Rohan Verma", city: "Mumbai", plan: "VIP", count: 64, coins: 5120, avatarColor: "bg-purple-500" },
  { rank: 7, name: "Ishita Kulkarni", city: "Pune", plan: "PREMIUM", count: 58, coins: 4740, avatarColor: "bg-pink-500" },
  { rank: 8, name: "Arjun Nair", city: "Kochi", plan: "FREE", count: 51, coins: 3980, avatarColor: "bg-teal-500" },
  { rank: 9, name: "Priya Iyer", city: "Chennai", plan: "VIP", count: 47, coins: 3610, avatarColor: "bg-orange-500" },
  { rank: 10, name: "Sameer Khan", city: "Hyderabad", plan: "FREE", count: 42, coins: 3140, avatarColor: "bg-lime-600" },
  { rank: 11, name: "Tanvi Gokhale", city: "Pune", plan: "PREMIUM", count: 38, coins: 2870, avatarColor: "bg-cyan-600" },
  { rank: 12, name: "Devang Shah", city: "Surat", plan: "FREE", count: 33, coins: 2410, avatarColor: "bg-fuchsia-500" },
];

export const sendersData: GiftUser[] = [
  { rank: 1, name: "Vikram Malhotra", city: "Delhi", plan: "ELITE", count: 210, coins: 24500, avatarColor: "bg-indigo-500" },
  { rank: 2, name: "Aditya Joshi", city: "Pune", plan: "VIP", count: 168, coins: 19340, avatarColor: "bg-emerald-500" },
  { rank: 3, name: "Neha Sharma", city: "Mumbai", plan: "PREMIUM", count: 132, coins: 14210, avatarColor: "bg-rose-500" },
  { rank: 4, name: "Karan Patel", city: "Ahmedabad", plan: "VIP", count: 118, coins: 12080, avatarColor: "bg-amber-500" },
  { rank: 5, name: "Sana Shaikh", city: "Bengaluru", plan: "FREE", count: 97, coins: 9660, avatarColor: "bg-sky-500" },
  { rank: 6, name: "Rahul Deshmukh", city: "Nagpur", plan: "PREMIUM", count: 84, coins: 8120, avatarColor: "bg-purple-500" },
  { rank: 7, name: "Meera Pillai", city: "Kochi", plan: "VIP", count: 71, coins: 6890, avatarColor: "bg-pink-500" },
  { rank: 8, name: "Ankit Rathi", city: "Jaipur", plan: "FREE", count: 63, coins: 5740, avatarColor: "bg-teal-500" },
  { rank: 9, name: "Divya Menon", city: "Bengaluru", plan: "PREMIUM", count: 55, coins: 4920, avatarColor: "bg-orange-500" },
  { rank: 10, name: "Harsh Vora", city: "Mumbai", plan: "FREE", count: 48, coins: 4110, avatarColor: "bg-lime-600" },
  { rank: 11, name: "Ritika Bansal", city: "Delhi", plan: "VIP", count: 41, coins: 3560, avatarColor: "bg-cyan-600" },
];

/* ================= SHARED HELPERS ================= */

export const planColor: Record<GiftUser["plan"], string> = {
  FREE: "text-gray-400",
  PREMIUM: "text-gray-500",
  VIP: "text-emerald-600",
  ELITE: "text-amber-600",
};

export const RankBadge = ({ rank }: { rank: number }) => (
  <span
    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
      rank === 1 ? "bg-amber-100 text-amber-700" : "bg-[#F1EEE9] text-[#8A857D]"
    }`}
  >
    {rank}
  </span>
);

export const Avatar = ({ user }: { user: GiftUser }) => (
  <span
    className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold text-white ${user.avatarColor}`}
  >
    {user.name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")}
  </span>
);

/* ================= COMPONENT ================= */

function GiftsData() {
  const router = useRouter();
  const [tab, setTab] = useState<"receivers" | "senders">("receivers");

  const activeUsers = tab === "receivers" ? receiversData : sendersData;
  const countLabel = tab === "receivers" ? "received" : "sent";

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* ---------- Top Gifts ---------- */}
      <div className="rounded-2xl border border-[#EBE7E0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-lg font-bold text-[#1C1B1A]">
            <span>🎁</span> Top gifts
          </h4>
          <span className="text-sm text-[#A39E96]">by most sent</span>
        </div>

        <div className="space-y-1">
          {topGifts.map((gift) => (
            <div
              key={gift.rank}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[#FAF8F5]"
            >
              <RankBadge rank={gift.rank} />
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#F0EDE7] bg-white text-xl shadow-sm">
                {gift.icon}
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1C1B1A]">
                  {gift.name}
                </p>
                <p className="text-xs text-[#A39E96]">
                  {gift.category} · 🪙 {gift.coins}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1C1B1A]">
                  {gift.sent}{" "}
                  <span className="text-xs font-normal text-[#A39E96]">
                    sent
                  </span>
                </p>
                <p className="text-xs font-semibold text-amber-600">
                  {gift.revenue}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ---------- Top Receivers / Senders ---------- */}
      <div className="rounded-2xl border border-[#EBE7E0] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-lg font-bold text-[#1C1B1A]">
            <span>🫶</span> Top gift {tab}
          </h4>

          {/* Toggle */}
          <div className="flex rounded-full border border-[#E5E1DA] bg-[#FAF8F5] p-1 text-xs font-semibold">
            {(["receivers", "senders"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`rounded-full px-3 py-1 capitalize transition ${
                  t === tab
                    ? "bg-white text-[#1C1B1A] shadow-sm"
                    : "text-[#A39E96]"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {activeUsers.slice(0, 5).map((u) => (
            <div
              key={u.rank}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-[#FAF8F5]"
            >
              <RankBadge rank={u.rank} />
              <Avatar user={u} />
              <div className="flex-1">
                <p className="text-sm font-semibold text-[#1C1B1A]">{u.name}</p>
                <p className={`text-xs ${planColor[u.plan]}`}>
                  {u.city} · {u.plan}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-[#1C1B1A]">
                  {u.count}{" "}
                  <span className="text-xs font-normal text-[#A39E96]">
                    {countLabel}
                  </span>
                </p>
                <p className="text-xs font-semibold text-amber-600">
                  🪙 {u.coins.toLocaleString("en-IN")}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ All Receiver Data button → opens receivers page */}
        <button
          onClick={() => router.push(`/revenue/gifts/receivers?tab=${tab}`)}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F1EEE9] py-3 text-sm font-semibold text-[#4A463F] transition-colors hover:bg-[#ECE8E1]"
        >
          All Receiver Data →
        </button>
      </div>
    </div>
  );
}

export default GiftsData;