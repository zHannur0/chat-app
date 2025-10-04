"use client";

import { Header } from "@/shared/components/Layout/Header";
import { useVerifyQuery } from "@/modules/auth/api/authApi";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const token = useMemo(
    () =>
      typeof window !== "undefined" ? localStorage.getItem("idToken") : null,
    []
  );

  const {
    data: user,
    isLoading,
    isError,
  } = useVerifyQuery(undefined, {
    skip: !token,
    refetchOnMountOrArgChange: true,
  });
  const pathname = usePathname();
  const viewKey = pathname;

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token]);

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      router.replace("/login");
    }
  }, [isLoading, isError, user, router]);

  return (
    <div>
      <Header />
      <motion.div
        key={viewKey}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </div>
  );
}
