'use client'

import DefaultLayout from '@/components/Layouts/DefaultLayout'
import React from 'react'
import CompletionRules from './componants/CompletionRules'
import IdentityAccess from './componants/IdentityAccess'
import DatingGoal from './componants/DatingGoal'
import { FiSearch, FiBell, FiHelpCircle } from 'react-icons/fi'
import AboutBasics from './componants/AboutBasics'
import EducationCarrer from './componants/EducationCarrer'
import Lifestyle from './componants/Lifestyle'
import Family from './componants/Family'
import PromptLibrary from './componants/PromptLibrary'
import InterestLibrary from './componants/InterestLibrary'
import ReligionCommunity from './componants/ReligionCommunity'
import Networkingintent from './componants/Networkingintent'
import Languages from './componants/Languages'

function Page() {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-[#f6f4ef]">
        {/* Fixed header */}
        <div className="sticky top-14 z-20 border-b border-gray-100 bg-[#f6f4ef]/95 backdrop-blur">
          <div className="mx-auto max-w-8xl px-6 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Onboarding settings</h1>
                <p className="text-sm text-gray-500">Control the new-member sign-up flow</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-400">
                  <FiSearch size={18} />
                  <input
                    placeholder="Search users, IDs, transactions…"
                    className="w-56 bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
                  />
                </div>
                <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-50">
                  <FiBell size={18} />
                </button>
                <button className="rounded-xl border border-gray-200 bg-white p-2.5 text-gray-500 transition hover:bg-gray-50">
                  <FiHelpCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling content */}
        <div className="mx-auto max-w-8xl px-6 py-6">
          <div className="space-y-6">
            <CompletionRules />
            {/* <IdentityAccess /> */}
            <DatingGoal />
            {/* <AboutBasics /> */}
            <EducationCarrer/>
            <Lifestyle />
            <Languages/>
       
            <Family/>
            <ReligionCommunity/>
            <InterestLibrary/>
            <Networkingintent/>
            <PromptLibrary/>
          </div>
        </div>
      </div>
    </DefaultLayout>
  )
}

export default Page