"use client";
import "jsvectormap/dist/jsvectormap.css";
import "flatpickr/dist/flatpickr.min.css";
import "@/css/satoshi.css";
import "@/css/style.css";
import React, { useEffect, useState } from "react";
import Loader from "@/components/common/Loader";
import { EmployeeRoleProvider } from "@/context/EmployeeRoleContext";
import { EmployeeProvider } from "@/context/EmployeeContext";
import { AuthProvider } from "@/context/AuthContext";
import { InterestedInProvider } from "@/context/InterestedInContext";
import { SexualOrientationProvider } from "@/context/SexualOrientationContext";
import { LifestyleProvider } from "@/context/LifestyleContext";
import { RealYouMattersProvider } from "@/context/RealYouMattersContext";
import { ThingsYouLoveProvider } from "@/context/ThingsYouLoveContext";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(true);

  // const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <EmployeeRoleProvider>
            <EmployeeProvider>
              <AuthProvider>
                <InterestedInProvider>
                  <SexualOrientationProvider>
                    <LifestyleProvider>
                      <RealYouMattersProvider>
                        <ThingsYouLoveProvider>
                      {loading ? <Loader /> : children}
                      </ThingsYouLoveProvider>
                      </RealYouMattersProvider>
                    </LifestyleProvider>
                  </SexualOrientationProvider>
                </InterestedInProvider>
              </AuthProvider>
            </EmployeeProvider>
          </EmployeeRoleProvider>
        </div>
      </body>
    </html>
  );
}
