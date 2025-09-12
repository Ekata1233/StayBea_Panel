import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import React from 'react'

const page = () => {
    return (
        <DefaultLayout>
            <div>
                <Breadcrumb pageName="Employee Role" />
            </div>
        </DefaultLayout>

    )
}

export default page