"use client";

import { Header } from "@/shared/components/Layout/Header";
import { useVerifyQuery } from "@/modules/auth/api/authApi";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const viewKey = `${pathname}?${search.toString()}`;

  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("idToken"));
    }
  }, []);

  const {
    data: user,
    isLoading,
    isError,
  } = useVerifyQuery(undefined, { skip: !token });

  useEffect(() => {
    if (!token || (!isLoading && (isError || !user))) {
      router.replace("/login");
    }
  }, [token, isLoading, isError, user, router]);

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
