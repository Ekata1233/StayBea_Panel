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
import { RealYouMattersProvider } from "@/context/RealYouMattersContext";
import { ThingsYouLoveProvider } from "@/context/ThingsYouLoveContext";
import { LookingForProvider } from "@/context/LookingForContext";
import { GenderProvider } from "@/context/GenderContext";
import { UserProvider } from "@/context/UserContext";
import { ReligionProvider } from "@/context/ReligionContext";
import { EducationProvider } from "@/context/EducationContext";
import { WorkDetailsProvider } from "@/context/WorkDetailsContext";
import { HealthWellnessProvider } from "@/context/HealthWellnessContext";
import { QuestionDeleteProvider } from "@/context/questionDeleteContext";
import { DateNowProvider } from "@/context/DateNowContext";
import { IntentionProvider } from "@/context/DatingGoalsContext";
import {
  EducationCareerProvider,
  ProfessionProvider
} from "@/context/Educationcarrercontext";
import { LifeStyleProvider } from "@/context/LifestyleContext";
import { InterestProvider } from "@/context/InterestContext";
import { FamilyProfileProvider } from "@/context/Familyprofilecontext";
import { WaitlistProvider } from "@/context/Waitlistcontext";

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
                    <RealYouMattersProvider>
                      <ThingsYouLoveProvider>
                        <LookingForProvider>
                          <GenderProvider>
                            <UserProvider>
                              <ReligionProvider>
                                <EducationProvider>
                                  <WorkDetailsProvider>
                                    <HealthWellnessProvider>
                                      <QuestionDeleteProvider>
                                        <DateNowProvider>
                                          <IntentionProvider>
                                            <EducationCareerProvider>
                                              <LifeStyleProvider>
                                                <InterestProvider>
                                                  <FamilyProfileProvider>
                                                    <WaitlistProvider>
                                                    {loading ? (
                                                      <Loader />
                                                    ) : (
                                                      children
                                                    )}
                                                    </WaitlistProvider>
                                                  </FamilyProfileProvider>
                                                </InterestProvider>
                                              </LifeStyleProvider>
                                            </EducationCareerProvider>
                                          </IntentionProvider>
                                        </DateNowProvider>
                                      </QuestionDeleteProvider>
                                    </HealthWellnessProvider>
                                  </WorkDetailsProvider>
                                </EducationProvider>
                              </ReligionProvider>
                            </UserProvider>
                          </GenderProvider>
                        </LookingForProvider>
                      </ThingsYouLoveProvider>
                    </RealYouMattersProvider>
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
