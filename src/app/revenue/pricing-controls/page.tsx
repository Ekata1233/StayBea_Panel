import DefaultLayout from '@/components/Layouts/DefaultLayout'
import React from 'react'
import RoseCompliments from './RoseCompliments'
import ComplimentTemplete from './ComplimentTemplete'
import BoostsSuperBoosts from './BoostsSuperBoosts'
import DatePlans from './DatePlans'

function page() {
  return (
    <div>
        <DefaultLayout>
            <RoseCompliments/>
            <ComplimentTemplete/>
            <BoostsSuperBoosts/>
            <DatePlans/>
        </DefaultLayout>
    </div>
  )
}

export default page