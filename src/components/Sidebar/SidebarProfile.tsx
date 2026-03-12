import { useState, useEffect } from "react";
import Image from "next/image";
import ClickOutside from "@/components/ClickOutside";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface IEmployeeDetails {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  image?: string;
  role: string;
  isActive: boolean;
}

const SidebarProfile = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { user, loading } = useAuth();

  const [details, setDetails] = useState<IEmployeeDetails | null>(null);

  console.log("Authenticated User in SidebarProfile:", details);

  useEffect(() => {
    if (!user?.userId) return;

    fetch(`/api/employee/details/${user.userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDetails(data.data);
      })
      .catch((err) => console.error("Failed to load employee details", err));
  }, [user]);

  if (loading) return null;

  const handleLogout = async () => {
    try {
      await fetch("/api/employee/auth/logout", {
        method: "POST",
        credentials: "include",
      });

      router.push("/admin/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  return (
    <div className="absolute bottom-2 left-2 right-2">
      <ClickOutside
        onClick={() => setDropdownOpen(false)}
        className="relative"
      >
        {/* Profile Card */}
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex cursor-pointer items-center gap-3 rounded-lg bg-white/20 p-3 backdrop-blur dark:bg-boxdark"
        >
          <div className="relative h-10 w-10">
            <Image
              src={`${details?.image || "/default-profile.png"}`} // Fallback to default image
              alt="User"
              fill
              className="rounded-full object-cover"
            />
          </div>

          <div className="flex flex-col text-sm">
            <span className="font-semibold text-white">
              {details
                ? `${details.firstName} ${details.lastName}`
                : "Loading..."}
            </span>

            <span className="text-xs text-gray-200">
              {details?.email || "loading@email.com"}
            </span>
          </div>

          <svg
            className="ml-auto fill-white"
            width="12"
            height="8"
            viewBox="0 0 12 8"
          >
            <path d="M6 8L0 0H12L6 8Z" />
          </svg>
        </div>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute bottom-18 left-0 w-full rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark">
            <ul className="flex flex-col">
              <li>
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  My Profile
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push("/settings")}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Settings
                </button>
              </li>

              {/* divider between settings and sign out */}
              <li>
                <hr className="my-2 border-gray-200 dark:border-gray-700" />
              </li>

              <li>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Sign out
                </button>
              </li>
            </ul>
          </div>
        )}
      </ClickOutside>
    </div>
  );
};

export default SidebarProfile;