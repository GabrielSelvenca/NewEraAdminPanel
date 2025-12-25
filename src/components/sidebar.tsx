"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Gamepad2, Users, Settings, LogOut, Wallet, ShoppingCart, Ticket, DollarSign, CreditCard, ChevronDown } from "lucide-react";
import { api } from "@/lib/api";
import { FeatureFlags } from "@/lib/feature-toggle";
import { useState } from "react";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, requireFeature: null },
  { href: "/dashboard/games", label: "Jogos", icon: Gamepad2, requireFeature: 'gamesEnabled' as const },
  { href: "/dashboard/partners", label: "Parceiros", icon: Wallet, requireFeature: 'gamesEnabled' as const },
  { href: "/dashboard/sellers", label: "Vendedores", icon: ShoppingCart, requireFeature: 'marketplaceEnabled' as const },
  { href: "/dashboard/orders", label: "Pedidos", icon: ShoppingCart, requireFeature: 'marketplaceEnabled' as const },
  { href: "/dashboard/coupons", label: "Cupons", icon: Ticket, requireFeature: null },
  { href: "/dashboard/users", label: "Usuários", icon: Users, requireFeature: null },
];

const configSubItems = [
  { href: "/dashboard/config", label: "Robux", icon: DollarSign, requireFeature: null },
  { href: "/dashboard/config/games", label: "Jogos", icon: Gamepad2, requireFeature: null },
  { href: "/dashboard/payment-settings", label: "Pagamento", icon: CreditCard, requireFeature: null },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [configOpen, setConfigOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignora erro de logout
    }
    router.push("/login");
  };

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-emerald-500" />
          </div>
          <span className="text-xl font-bold text-zinc-100">Nova Era</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems
          .filter((item) => !item.requireFeature || FeatureFlags[item.requireFeature])
          .map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        
        {/* Configurações com Menu Colapsável */}
        <div>
          <button
            onClick={() => setConfigOpen(!configOpen)}
            className="flex items-center justify-between w-full px-4 py-3 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5" />
              <span className="font-medium">Configurações</span>
            </div>
            <ChevronDown 
              className={cn(
                "w-4 h-4 transition-transform duration-200",
                configOpen ? "rotate-180" : ""
              )}
            />
          </button>
          
          <div 
            className={cn(
              "ml-4 space-y-1 overflow-hidden transition-all duration-200",
              configOpen ? "max-h-96 opacity-100 mt-1" : "max-h-0 opacity-0"
            )}
          >
            {configSubItems
              .filter((item) => !item.requireFeature || FeatureFlags[item.requireFeature])
              .map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors text-sm",
                      isActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  );
}
