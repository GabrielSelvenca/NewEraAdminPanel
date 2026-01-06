"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  LogOut, 
  Settings, 
  Ticket, 
  Link2, 
  Package,
  Bot,
  Timer,
  Palette,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";
import { useContext, useState } from "react";
import { UserContext } from "@/lib/user-context";
import { motion, AnimatePresence } from "framer-motion";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: string[];
  badge?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { 
    href: "/dashboard", 
    label: "Dashboard", 
    icon: LayoutDashboard, 
    allowedRoles: ['admin', 'gerente', 'auxiliar'] 
  },
  { 
    href: "/dashboard/orders", 
    label: "Pedidos", 
    icon: Package, 
    allowedRoles: ['admin', 'gerente', 'auxiliar'] 
  },
  { 
    href: "/dashboard/users", 
    label: "Usuários", 
    icon: Users, 
    allowedRoles: ['admin'] 
  },
  { 
    href: "/dashboard/coupons", 
    label: "Cupons", 
    icon: Ticket, 
    allowedRoles: ['admin', 'gerente'] 
  },
];

const botMenuItems: MenuItem[] = [
  { 
    href: "/dashboard/config", 
    label: "Visual & Mensagens", 
    icon: Palette, 
    allowedRoles: ['admin', 'gerente'] 
  },
  { 
    href: "/dashboard/bot-settings", 
    label: "Tempos & Limites", 
    icon: Timer, 
    allowedRoles: ['admin', 'gerente'] 
  },
];

const settingsMenuItems: MenuItem[] = [
  { 
    href: "/dashboard/integrations", 
    label: "Integrações", 
    icon: Link2, 
    allowedRoles: ['admin', 'gerente', 'auxiliar'] 
  },
  { 
    href: "/dashboard/settings", 
    label: "Minha Conta", 
    icon: UserCog, 
    allowedRoles: ['admin', 'gerente', 'auxiliar'] 
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useContext(UserContext);
  const userRole = user?.role || 'auxiliar';
  const [botMenuOpen, setBotMenuOpen] = useState(
    pathname.includes('/config') || pathname.includes('/bot-settings')
  );

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignora erro
    }
    router.push("/login");
  };

  const filterByRole = (items: MenuItem[]) => 
    items.filter(item => item.allowedRoles.includes(userRole));

  const isActive = (href: string) => 
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const NavItem = ({ item, nested = false }: { item: MenuItem; nested?: boolean }) => {
    const active = isActive(item.href);
    
    return (
      <Link href={item.href}>
        <motion.div
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group cursor-pointer",
            nested && "ml-4 text-sm",
            active
              ? "bg-gradient-to-r from-cyan-500/15 to-transparent text-cyan-400"
              : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
          )}
        >
          <item.icon className={cn(
            "w-5 h-5 transition-colors",
            nested && "w-4 h-4",
            active ? "text-cyan-400" : "text-zinc-500 group-hover:text-zinc-300"
          )} />
          <span className="font-medium flex-1">{item.label}</span>
          {active && (
            <motion.div 
              layoutId="activeIndicator"
              className="w-1.5 h-1.5 rounded-full bg-cyan-400"
            />
          )}
          {item.badge && (
            <span className="px-2 py-0.5 text-xs font-medium bg-cyan-500/20 text-cyan-400 rounded-full">
              {item.badge}
            </span>
          )}
        </motion.div>
      </Link>
    );
  };

  return (
    <aside className="w-72 bg-[#0c0c0e] border-r border-zinc-800/50 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-800/50">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg glow-cyan overflow-hidden">
            <Image 
              src="/assets/icons/logo.png" 
              alt="NewEra Logo"
              width={48}
              height={48}
              className="object-cover"
              onError={(e) => {
                // Fallback se a imagem não existir
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>';
              }}
            />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">NewEra</h1>
            <p className="text-xs text-zinc-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User Card */}
      <div className="p-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || 'Usuário'}
              </p>
              <p className="text-xs text-cyan-400 capitalize flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {user?.role || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-6 overflow-y-auto py-2">
        {/* Main Menu */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
            Principal
          </p>
          <div className="space-y-1">
            {filterByRole(menuItems).map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>

        {/* Bot Config */}
        {filterByRole(botMenuItems).length > 0 && (
          <div>
            <button
              onClick={() => setBotMenuOpen(!botMenuOpen)}
              className="w-full px-4 mb-2 flex items-center justify-between text-xs font-semibold text-zinc-600 uppercase tracking-wider hover:text-zinc-400 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5" />
                Configuração Bot
              </span>
              <motion.div
                animate={{ rotate: botMenuOpen ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </motion.div>
            </button>
            <AnimatePresence>
              {botMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-1 overflow-hidden"
                >
                  {filterByRole(botMenuItems).map((item) => (
                    <NavItem key={item.href} item={item} nested />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Settings */}
        <div>
          <p className="px-4 mb-2 text-xs font-semibold text-zinc-600 uppercase tracking-wider">
            Configurações
          </p>
          <div className="space-y-1">
            {filterByRole(settingsMenuItems).map((item) => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-zinc-800/50">
        <motion.button
          whileHover={{ x: 4 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
        >
          <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
          <span className="font-medium">Sair</span>
        </motion.button>
      </div>
    </aside>
  );
}
