import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import React from 'react'

const page = () => {
  return (
         <DefaultLayout>
            <div>
                <Breadcrumb pageName="Add Employee" />
            </div>
        </DefaultLayout>
  )
}

export default page