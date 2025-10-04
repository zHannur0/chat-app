"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { useVerifyQuery } from "@/modules/auth/api/authApi";

export const Header = () => {
  const router = useRouter();
  const { data: user } = useVerifyQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const handleLogout = () => {
    localStorage.removeItem("idToken");
    router.push("/login");
  };

  return (
    <header className="flex justify-between items-center bg-white border-b border-border text-inverse px-6 py-[18px] sticky top-0 left-0 right-0">
      <Image
        src="img/Logo.svg"
        alt="Logo"
        width={146}
        height={42}
        onClick={() => router.push("/chat")}
        className="cursor-pointer"
      />
      <div className="flex flex-col gap-1 items-end ">
        <h2
          className="text-lg font-medium cursor-pointer"
          onClick={() => router.push("/profile")}
        >
          {user?.displayName || user?.email}
        </h2>
        <p className="opacity-50 cursor-pointer" onClick={handleLogout}>
          Logout
        </p>
      </div>
    </header>
  );
};

export default Header;
