"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, UserCog, LogOut, Zap, Settings, Ticket, Link2, Package } from "lucide-react";
import { api } from "@/lib/api";
import { useContext } from "react";
import { UserContext } from "@/lib/user-context";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, allowedRoles: ['admin', 'gerente', 'auxiliar'] },
  { href: "/dashboard/orders", label: "Pedidos", icon: Package, allowedRoles: ['admin', 'gerente', 'auxiliar'] },
  { href: "/dashboard/users", label: "Usuários", icon: Users, allowedRoles: ['admin'] },
  { href: "/dashboard/coupons", label: "Cupons", icon: Ticket, allowedRoles: ['admin', 'gerente'] },
  { href: "/dashboard/config", label: "Config. Bot", icon: Settings, allowedRoles: ['admin', 'gerente'] },
  { href: "/dashboard/integrations", label: "Integrações", icon: Link2, allowedRoles: ['admin', 'gerente', 'auxiliar'] },
  { href: "/dashboard/settings", label: "Minha Conta", icon: UserCog, allowedRoles: ['admin', 'gerente', 'auxiliar'] },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useContext(UserContext);
  const userRole = user?.role || 'auxiliar';

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignora erro
    }
    router.push("/login");
  };

  const filteredItems = menuItems.filter(item => item.allowedRoles.includes(userRole));

  return (
    <aside className="w-72 bg-gradient-to-b from-zinc-900 to-zinc-950 border-r border-zinc-800/50 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold text-white">NewEra</span>
            <p className="text-xs text-zinc-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="mx-4 mb-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Usuário'}</p>
            <p className="text-xs text-emerald-400 capitalize">{user?.role || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Menu Label */}
      <div className="px-6 mb-2">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Menu</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-emerald-500/15 text-emerald-400 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-800/70"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "text-emerald-400" : "group-hover:scale-110"
              )} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 bg-emerald-400 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-zinc-800/50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
