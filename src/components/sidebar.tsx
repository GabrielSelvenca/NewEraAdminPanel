"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Users, 
  UserCog, 
  UserCheck,
  LogOut, 
  Ticket, 
  Package,
  Bot,
  Timer,
  Palette,
  ChevronRight,
  Zap,
  ExternalLink,
  Shield,
  Circle,
  Gamepad2
} from "lucide-react";
import { api } from "@/lib/api";
import { useContext, useState, useEffect, useRef } from "react";
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
    href: "/dashboard/games", 
    label: "Jogos", 
    icon: Gamepad2, 
    allowedRoles: ['admin', 'gerente'] 
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
  { 
    href: "/dashboard/sellers", 
    label: "Sellers & Auxiliares", 
    icon: UserCheck, 
    allowedRoles: ['admin'] 
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

// Configurações pessoais agora estão no perfil do usuário (dropdown)

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useContext(UserContext);
  const userRole = user?.role || 'auxiliar';
  const [botMenuOpen, setBotMenuOpen] = useState(
    pathname.includes('/config') || pathname.includes('/bot-settings')
  );
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Check API status periodically
  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        await api.getConfig();
        setApiStatus('online');
      } catch {
        setApiStatus('offline');
      }
    };
    
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignora erro
    }
    router.push("/login");
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'from-red-500 to-orange-500';
      case 'gerente': return 'from-purple-500 to-pink-500';
      case 'auxiliar': return 'from-blue-500 to-cyan-500';
      default: return 'from-zinc-500 to-zinc-600';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'gerente': return 'Gerente';
      case 'auxiliar': return 'Auxiliar';
      default: return role;
    }
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
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center shadow-lg glow-cyan">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold gradient-text">NewEra</h1>
            <p className="text-xs text-zinc-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* User Card - Interactive */}
      <div className="p-4" ref={userMenuRef}>
        <div className="relative">
          <motion.button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "w-full glass-card p-3 cursor-pointer transition-all duration-200",
              userMenuOpen && "ring-1 ring-cyan-500/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                {/* Status indicator */}
                <div className={cn(
                  "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0c0c0e]",
                  apiStatus === 'online' && "bg-emerald-500",
                  apiStatus === 'offline' && "bg-red-500",
                  apiStatus === 'checking' && "bg-yellow-500 animate-pulse"
                )} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.name || 'Usuário'}
                </p>
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-gradient-to-r text-white",
                    getRoleBadgeColor(user?.role || '')
                  )}>
                    <Shield className="w-2.5 h-2.5" />
                    {getRoleLabel(user?.role || 'N/A')}
                  </span>
                </div>
              </div>
              <motion.div
                animate={{ rotate: userMenuOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="w-4 h-4 text-zinc-500 rotate-90" />
              </motion.div>
            </div>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 right-0 top-full mt-2 z-50 glass-card overflow-hidden"
              >
                {/* User Info Header */}
                <div className="p-3 border-b border-zinc-800/50 bg-zinc-900/50">
                  <p className="text-xs text-zinc-500 mb-1">Conectado como</p>
                  <p className="text-sm font-medium text-white truncate">{user?.username || user?.name}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Circle className={cn(
                      "w-2 h-2",
                      apiStatus === 'online' && "text-emerald-500 fill-emerald-500",
                      apiStatus === 'offline' && "text-red-500 fill-red-500",
                      apiStatus === 'checking' && "text-yellow-500 fill-yellow-500"
                    )} />
                    <span className={cn(
                      "text-xs font-medium",
                      apiStatus === 'online' && "text-emerald-400",
                      apiStatus === 'offline' && "text-red-400",
                      apiStatus === 'checking' && "text-yellow-400"
                    )}>
                      {apiStatus === 'online' && 'API Online'}
                      {apiStatus === 'offline' && 'API Offline'}
                      {apiStatus === 'checking' && 'Verificando...'}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                  <Link href="/dashboard/profile" onClick={() => setUserMenuOpen(false)}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer"
                    >
                      <UserCog className="w-4 h-4" />
                      <span className="text-sm font-medium">Meu Perfil</span>
                    </motion.div>
                  </Link>

                  {user?.role === 'admin' && (
                    <a
                      href="https://discord.com/developers/applications"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                    >
                      <motion.div
                        whileHover={{ x: 4 }}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span className="text-sm font-medium">Portal Discord</span>
                      </motion.div>
                    </a>
                  )}
                </div>

                {/* Logout */}
                <div className="p-2 border-t border-zinc-800/50">
                  <motion.button
                    whileHover={{ x: 4 }}
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sair da conta</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
