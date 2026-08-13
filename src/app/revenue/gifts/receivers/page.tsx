// app/gifts/receivers/page.tsx
"use client";

import { Suspense, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DefaultLayout from "@/components/Layouts/DefaultLayout";
import GenericTable from "@/components/ui/GenericTable";
import {
  receiversData,
  sendersData,
  planColor,
  RankBadge,
  Avatar,
  GiftUser,
} from "../GiftsData";

const PAGE_SIZE = 10;

function ReceiversContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab =
    searchParams.get("tab") === "senders" ? "senders" : "receivers";

  const [tab, setTab] = useState<"receivers" | "senders">(initialTab);
  const [page, setPage] = useState(1);

  const allUsers = tab === "receivers" ? receiversData : sendersData;
  const totalPages = Math.max(1, Math.ceil(allUsers.length / PAGE_SIZE));

  const pageData = useMemo(
    () => allUsers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allUsers, page],
  );

  const switchTab = (t: "receivers" | "senders") => {
    setTab(t);
    setPage(1);
  };

  const from = (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, allUsers.length);

  return (
    <div className="min-h-screen bg-[#F7F5F1] px-7 py-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={() => router.back()}
            className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-[#8A857D] transition-colors hover:text-[#1C1B1A]"
          >
            ← Back
          </button>
          <h1 className="text-[22px] font-bold text-[#1C1B1A]">
            All gift {tab}
          </h1>
          <p className="mt-1 text-sm text-[#8A857D]">
            Complete list of members ranked by gifts{" "}
            {tab === "receivers" ? "received" : "sent"}
          </p>
        </div>

        {/* Toggle */}
        <div className="flex rounded-full border border-[#E5E1DA] bg-white p-1 text-sm font-semibold">
          {(["receivers", "senders"] as const).map((t) => (
            <button
              key={t}
              onClick={() => switchTab(t)}
              className={`rounded-full px-4 py-1.5 capitalize transition ${
                t === tab
                  ? "bg-[#7C5CFA] text-white shadow-sm"
                  : "text-[#8A857D]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <GenericTable
        title={`Gift ${tab} (${allUsers.length})`}
        isDeleting={null}
        showActions={false}
        data={pageData}
        columns={[
          {
            header: "Rank",
            accessor: "rank",
            align: "center",
            render: (row: GiftUser) => (
              <div className="flex justify-center">
                <RankBadge rank={row.rank} />
              </div>
            ),
          },
          {
            header: "User",
            accessor: "name",
            render: (row: GiftUser) => (
              <div className="flex items-center gap-3">
                <Avatar user={row} />
                <span className="font-medium text-[#1C1B1A]">{row.name}</span>
              </div>
            ),
          },
          { header: "City", accessor: "city" },
          {
            header: "Plan",
            accessor: "plan",
            render: (row: GiftUser) => (
              <span className={`text-xs font-semibold ${planColor[row.plan]}`}>
                {row.plan}
              </span>
            ),
          },
          {
            header: tab === "receivers" ? "Gifts Received" : "Gifts Sent",
            accessor: "count",
            align: "center",
            render: (row: GiftUser) => (
              <span className="font-semibold">{row.count}</span>
            ),
          },
          {
            header: "Coins Value",
            accessor: "coins",
            align: "right",
            render: (row: GiftUser) => (
              <span className="font-semibold text-amber-600">
                🪙 {row.coins.toLocaleString("en-IN")}
              </span>
            ),
          },
        ]}
      />

      {/* Pagination */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-[#8A857D]">
          Showing{" "}
          <span className="font-semibold text-[#1C1B1A]">
            {from}–{to}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-[#1C1B1A]">
            {allUsers.length}
          </span>
        </p>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-[#E5E1DA] bg-white px-3 py-1.5 text-sm font-semibold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            ← Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                p === page
                  ? "bg-[#7C5CFA] text-white"
                  : "border border-[#E5E1DA] bg-white text-[#4A463F] hover:bg-[#FAF8F5]"
              }`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-[#E5E1DA] bg-white px-3 py-1.5 text-sm font-semibold text-[#1C1B1A] transition-colors hover:bg-[#FAF8F5] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <DefaultLayout>
      <Suspense fallback={null}>
        <ReceiversContent />
      </Suspense>
    </DefaultLayout>
  );
}