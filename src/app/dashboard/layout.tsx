"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { ApiStatus } from "@/components/api-status";
import { api } from "@/lib/api";
import { UserContext, User } from "@/lib/user-context";
import { motion } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function checkAuth() {
      try {
        const userData = await api.getCurrentUser();
        setUser(userData);
        setLoading(false);
      } catch {
        router.push("/login");
      }
    }
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 animate-pulse" />
            <div className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 blur-xl opacity-50 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <UserContext.Provider value={user}>
      <div className="flex min-h-screen bg-[#09090b]">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="bg-grid-pattern min-h-full">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="p-8 max-w-[1600px] mx-auto"
            >
              {children}
            </motion.div>
          </div>
        </main>
        <ApiStatus />
      </div>
    </UserContext.Provider>
  );
}
