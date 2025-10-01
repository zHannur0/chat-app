'use client'

import { Header } from "@/shared/components/Layout/Header";
import { useVerifyQuery } from "@/modules/auth/api/authApi";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

export default function MainLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const token = useMemo(() => (typeof window !== 'undefined' ? localStorage.getItem('idToken') : null), []);
    const { data: user, isLoading, isError } = useVerifyQuery(undefined, { skip: !token });

    useEffect(() => {
        if (!token) {
            router.replace('/login');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token]);

    useEffect(() => {
        if (!isLoading && (isError || !user)) {
            router.replace('/login');
        }
    }, [isLoading, isError, user, router]);

    return (
        <div>
            <Header />
            {!isLoading && user ? children : null}
        </div>
    )
}