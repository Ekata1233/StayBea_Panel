'use client'

import DefaultLayout from '@/components/Layouts/DefaultLayout'
import React from 'react'
import PackageRevenue from './package-revenue/page'
import PackageModule from './package-module/page'
import PlanComparison from './PlanComparison'

export default function Page() {
  return (
    <DefaultLayout>
      {/* <PackageRevenue /> */}
      <PackageModule/>
      {/* <PlanComparison/> */}
    </DefaultLayout>
  )
}