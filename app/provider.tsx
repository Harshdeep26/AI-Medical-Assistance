"use client"
import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { useUser } from '@clerk/nextjs';
import { UserDetailContext } from '@/context/UserDetailContext';

export type UserDetail = {
    name: string,
    email: string,
    credits: number
}

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {

    const { user } = useUser();
    const [userDetail,setuserDeatil]=useState<any>()

    useEffect(() => {
        user && CreateNewUser();
    }, [user])

    const CreateNewUser = async () => {
        const result = await axios.post('/api/users');
        console.log(result.data);
        setuserDeatil(result.data);
    }

    return (
        <div>
            <UserDetailContext.Provider value={{userDetail,setuserDeatil}}>
                {children}
            </UserDetailContext.Provider>
        </div>
    )
}

export default Provider
