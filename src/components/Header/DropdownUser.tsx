import { useState } from "react";
import ClickOutside from "@/components/ClickOutside";
import Image from "next/image";

const modules = [
  { name: "Mariage", icon: "https://ik.imagekit.io/hzyuadmua/employees/pepsi_remove_s44QU-UacL.png" , active: true },
  { name: "Long Term", icon: "https://ik.imagekit.io/hzyuadmua/employees/pepsi_remove_s44QU-UacL.png" , active: true },
  { name: "Casual", icon: "https://ik.imagekit.io/hzyuadmua/employees/pepsi_remove_s44QU-UacL.png" , active: true },
];

const ModulesDropdown = () => {
  const [open, setOpen] = useState(false);

  return (
    <ClickOutside onClick={() => setOpen(false)} className="relative">

      {/* BUTTON */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-0 bg-gray-800 text-white px-16 py-4 "
      >
        {modules[0].name}
      </button>

      {/* MODULE POPUP */}
      {open && (
        <div className="absolute right-0 mt-5 w-[380px] rounded-xl bg-white shadow-lg border border-stroke dark:bg-boxdark">

          {/* HEADER */}
          <div className="p-5">
            <h3 className="font-semibold text-gray-800 dark:text-white">
              Modules Section
            </h3>
          </div>

          {/* MODULE GRID */}
          <div className="grid grid-cols-3 gap-4 p-5 pt-0">

            {modules.map((module, i) => (
              <div
                key={i}
                className={`flex flex-col items-center justify-center border rounded-lg p-4 cursor-pointer transition
                ${
                  module.active
                    ? "bg-gray-800 text-white"
                    : "hover:bg-gray-100"
                }`}
              >
                <Image
                  src={module.icon}
                  width={30}
                  height={30}
                  alt={module.name}
                />

                <span className="mt-2 text-sm font-medium">
                  {module.name}
                </span>
              </div>
            ))}

            {/* ADD BUTTON */}
            <div className="flex items-center justify-center border rounded-lg p-4 cursor-pointer hover:bg-gray-100">
              <span className="text-3xl text-gray-400">+</span>
            </div>

          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default ModulesDropdown;