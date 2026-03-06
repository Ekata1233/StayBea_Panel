"use client";

import Breadcrumb from '@/components/Breadcrumbs/Breadcrumb'
import Loader from '@/components/common/Loader';
import DefaultLayout from '@/components/Layouts/DefaultLayout'
import { useUserContext } from '@/context/UserContext';
import React from 'react'

const Page = () => {
    const { user, userLoading, userError, refreshUser } = useUserContext();

  if (userLoading) return <Loader />;

  if (userError) return <p>{userError}</p>;
  return (
    <DefaultLayout>
      <Breadcrumb pageName="User List" />

      
       <div>
      </div>
    </DefaultLayout>
  )
}

export default Page