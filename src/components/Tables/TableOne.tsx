import { BRAND } from "@/types/brand";
import Image from "next/image";
import { Pencil, Trash2, Eye } from "lucide-react"; // ✅ Make sure lucide-react is installed

const brandData: BRAND[] = [
  {
    logo: "/images/brand/brand-01.svg",
    name: "Google",
    visitors: 3.5,
    revenues: "5,768",
    sales: 590,
    conversion: 4.8,
    status: "Active",
  },
  {
    logo: "/images/brand/brand-02.svg",
    name: "Twitter",
    visitors: 2.2,
    revenues: "4,635",
    sales: 467,
    conversion: 4.3,
    status: "Inactive",
  },
  {
    logo: "/images/brand/brand-03.svg",
    name: "Github",
    visitors: 2.1,
    revenues: "4,290",
    sales: 420,
    conversion: 3.7,
    status: "Active",
  },
  {
    logo: "/images/brand/brand-04.svg",
    name: "Vimeo",
    visitors: 1.5,
    revenues: "3,580",
    sales: 389,
    conversion: 2.5,
    status: "Active",
  },
  {
    logo: "/images/brand/brand-05.svg",
    name: "Facebook",
    visitors: 3.5,
    revenues: "6,768",
    sales: 390,
    conversion: 4.2,
    status: "Inactive",
  },
];

const TableOne = () => {
  return (
    <div className="rounded-lg border border-stroke bg-white px-5 pb-4 pt-6 shadow-md dark:border-strokedark dark:bg-boxdark sm:px-7.5">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Top Channels
      </h4>

      <div className="flex flex-col overflow-x-auto">
        <div className="grid grid-cols-5 rounded-md bg-gray-2 text-sm font-semibold dark:bg-meta-4 sm:grid-cols-7">
          <div className="p-3">Source</div>
          <div className="p-3 text-center">Visitors</div>
          <div className="p-3 text-center">Revenues</div>
          <div className="hidden p-3 text-center sm:block">Sales</div>
          <div className="hidden p-3 text-center sm:block">Conversion</div>
          <div className="p-3 text-center">Status</div>
          <div className="p-3 text-center">Actions</div>
        </div>

        {brandData.map((brand, key) => (
          <div
            className={`grid grid-cols-5 sm:grid-cols-7 items-center hover:bg-gray-50 dark:hover:bg-meta-3 transition ${
              key === brandData.length - 1
                ? ""
                : "border-b border-stroke dark:border-strokedark"
            }`}
            key={key}
          >
            {/* Source */}
            <div className="flex items-center gap-3 p-3">
              <Image src={brand.logo} alt="Brand" width={40} height={40} />
              <p className="text-black dark:text-white">{brand.name}</p>
            </div>

            {/* Visitors */}
            <div className="text-center p-3 text-black dark:text-white">
              {brand.visitors}K
            </div>

            {/* Revenues */}
            <div className="text-center p-3 text-meta-3">
              ${brand.revenues}
            </div>

            {/* Sales */}
            <div className="hidden text-center p-3 sm:block text-black dark:text-white">
              {brand.sales}
            </div>

            {/* Conversion */}
            <div className="hidden text-center p-3 sm:block text-meta-5">
              {brand.conversion}%
            </div>

            {/* Status */}
            <div className="text-center p-3">
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

            {/* Actions */}
            <div className="flex justify-center gap-2 p-3">
              {/* View */}
              <button className="p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300 transition">
                <Eye size={18} />
              </button>
              {/* Update */}
              <button className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 transition">
                <Pencil size={18} />
              </button>
              {/* Delete */}
              <button className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900 dark:text-red-300 transition">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TableOne;
