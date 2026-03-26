import { useState, useEffect } from "react";
import ClickOutside from "@/components/ClickOutside";
import Image from "next/image";

const modules = [
  {
    name: "Date to Marry",
    icon: "https://ik.imagekit.io/hzyuadmua/looking-for/marry_RPG5uu298.png",
    active: true,
  },
  {
    name: "Dating",
    icon: "https://ik.imagekit.io/hzyuadmua/looking-for/dating_B3RGgVse4.png",
    active: true,
  },
  {
    name: "Mature Connection",
    icon: "https://ik.imagekit.io/hzyuadmua/looking-for/mature_VrCXcpcbu.png",
    active: true,
  },
];

const ModulesDropdown = () => {
  const [open, setOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState(modules[0]);

  // ✅ Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("selectedModule");
    if (stored) {
      setSelectedModule(JSON.parse(stored));
    }
  }, []);

  // ✅ Handle selection
  const handleSelect = (module: any) => {
    setSelectedModule(module);
    localStorage.setItem("selectedModule", JSON.stringify(module));
    setOpen(false); // close dropdown
  };

  return (
    <ClickOutside onClick={() => setOpen(false)} className="relative">
      {/* BUTTON - Now with center alignment and icon */}
      <button
        onClick={() => setOpen(!open)}
        className="flex w-[250px] items-center justify-center gap-2 bg-[#A54275] px-10 py-4 text-white"
      >
        <Image
          src={selectedModule.icon}
          width={20}
          height={20}
          alt={selectedModule.name}
          className="object-contain"
        />
        <span>{selectedModule.name}</span>
      </button>

      {/* MODULE POPUP */}
      {open && (
        <div className="absolute right-0 mt-5 w-[380px] rounded-xl border border-stroke bg-white shadow-lg dark:bg-boxdark">
          {/* HEADER */}
          <div className="p-5">
            <h3 className="text-center font-semibold text-[#A54275] dark:text-white">
              Modules Section
            </h3>
          </div>

          {/* MODULE GRID */}
          <div className="grid grid-cols-3 gap-4 p-5 pt-0">
            {modules.map((module, i) => (
              <div
                key={i}
                onClick={() => handleSelect(module)} // ✅ click handler
                className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border p-4 transition
                ${
                  selectedModule.name === module.name
                    ? "bg-[#A54275] text-white"
                    : "hover:bg-[#A54275]/10"
                }`}
              >
                <Image
                  src={module.icon}
                  width={30}
                  height={30}
                  alt={module.name}
                  className="object-contain"
                />

                <span className="mt-2 text-center text-sm font-medium">
                  {module.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ClickOutside>
  );
};

export default ModulesDropdown;
