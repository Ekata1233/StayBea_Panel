import { BRAND } from "@/types/brand";
import Image from "next/image";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const brandData: (BRAND & {
  region: string;
  lastUpdate: string;
  growth: number;
  engagement: number;
})[] = [
  {
    logo: "/images/brand/brand-01.svg",
    name: "Google",
    visitors: 3.5,
    revenues: "5,768",
    sales: 590,
    conversion: 4.8,
    status: "Active",
    region: "USA",
    lastUpdate: "12 Jan 2026",
    growth: 12.5,
    engagement: 78,
  },
  {
    logo: "/images/brand/brand-02.svg",
    name: "Twitter",
    visitors: 2.2,
    revenues: "4,635",
    sales: 467,
    conversion: 4.3,
    status: "Inactive",
    region: "India",
    lastUpdate: "10 Jan 2026",
    growth: -2.3,
    engagement: 65,
  },
  {
    logo: "/images/brand/brand-03.svg",
    name: "Github",
    visitors: 2.1,
    revenues: "4,290",
    sales: 420,
    conversion: 3.7,
    status: "Active",
    region: "Germany",
    lastUpdate: "08 Jan 2026",
    growth: 8.7,
    engagement: 82,
  },
  {
    logo: "/images/brand/brand-04.svg",
    name: "Vimeo",
    visitors: 1.5,
    revenues: "3,580",
    sales: 389,
    conversion: 2.5,
    status: "Active",
    region: "UK",
    lastUpdate: "05 Jan 2026",
    growth: 5.2,
    engagement: 71,
  },
  {
    logo: "/images/brand/brand-05.svg",
    name: "Facebook",
    visitors: 3.5,
    revenues: "6,768",
    sales: 390,
    conversion: 4.2,
    status: "Inactive",
    region: "Canada",
    lastUpdate: "02 Jan 2026",
    growth: 15.3,
    engagement: 88,
  },
];

const TableOne = () => {
      const { user, loading } = useAuth();
      
    if (loading) return null;
  return (
    <div className="rounded-lg border border-stroke bg-white px-5 pb-4 pt-6 shadow-md dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Top Channels
      </h4>

      {/* ✅ Horizontal Scroll Container */}
      <div className="overflow-x-auto">
        <div className="min-w-[1000px]"> {/* Increased width for better spacing */}
          {/* ================= HEADER ================= */}
          <div className="grid grid-cols-11 rounded-md bg-gray-2 text-sm font-semibold dark:bg-m
          eta-4">
            <div className="p-3 w-[180px]">Source</div>
            <div className="p-3 text-center w-[100px]">Visitors</div>
            <div className="p-3 text-center w-[120px]">Revenues</div>
            <div className="p-3 text-center w-[100px]">Sales</div>
            <div className="p-3 text-center w-[120px]">Conversion</div>
            <div className="p-3 text-center w-[100px]">Status</div>
            <div className="p-3 text-center w-[100px]">Region</div>
            <div className="p-3 text-center w-[120px]">Last Update</div>
            <div className="p-3 text-center w-[100px]">Growth %</div>
            <div className="p-3 text-center w-[160px]">Engagement %</div>
            <div className="p-3 text-center w-[160px]">Actions</div>
          </div>

          {/* ================= BODY ================= */}
          {brandData.map((brand, key) => (
            <div
              key={key}
              className={`grid grid-cols-11 items-center hover:bg-gray-50 dark:hover:bg-meta-3 transition ${
                key === brandData.length - 1
                  ? ""
                  : "border-b border-stroke dark:border-strokedark"
              }`}
            >
              {/* Source */}
              <div className="flex items-center gap-3 p-3 w-[180px]">
                <Image src={brand.logo} alt="Brand" width={40} height={40} />
                <p className="text-black dark:text-white">{brand.name}</p>
              </div>

              {/* Visitors */}
              <div className="text-center p-3 text-black dark:text-white w-[100px]">
                {brand.visitors}K
              </div>

              {/* Revenues */}
              <div className="text-center p-3 text-meta-3 w-[120px]">
                ${brand.revenues}
              </div>

              {/* Sales */}
              <div className="text-center p-3 text-black dark:text-white w-[100px]">
                {brand.sales}
              </div>

              {/* Conversion */}
              <div className="text-center p-3 text-meta-5 w-[120px]">
                {brand.conversion}%
              </div>

              {/* Status */}
              <div className="text-center p-3 w-[100px]">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    brand.status === "Active"
                      ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {brand.status}
                </span>
              </div>

              {/* Region */}
              <div className="text-center p-3 text-black dark:text-white w-[100px]">
                {brand.region}
              </div>

              {/* Last Update */}
              <div className="text-center p-3 text-black dark:text-white w-[120px]">
                {brand.lastUpdate}
              </div>

              {/* Growth % (NEW) */}
              <div className="text-center p-3 w-[100px]">
                <span
                  className={`font-medium ${
                    brand.growth >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {brand.growth >= 0 ? "+" : ""}{brand.growth}%
                </span>
              </div>

              {/* Engagement % (NEW) */}
              <div className="text-center p-3  w-[160px]">
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-black dark:text-white font-medium">
                    {brand.engagement}%
                  </span>
                  <div className="w-full max-w-[80px] bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${brand.engagement}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-center gap-3 p-3 w-[180px]">
                <button 
                  className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 transition"
                  title="View"
                >
                  <Eye size={18} />
                </button>
                {user?.manageAccess.Update &&
                <button 
                  className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>
                }
                <button 
                  className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition"
                  title="Delete"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TableOne;