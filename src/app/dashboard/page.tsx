"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/user-context";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  DollarSign, 
  Clock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Activity,
  TrendingUp,
  Zap,
  Settings,
  ExternalLink,
  Calendar,
  ChevronDown
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  periodOrders: number;
  periodRevenue: number;
  pendingDeliveries: number;
  completedPeriod: number;
}

interface PeriodOption {
  value: number;
  label: string;
  shortLabel: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const periodOptions: PeriodOption[] = [
  { value: 1, label: "Hoje", shortLabel: "1d" },
  { value: 3, label: "Últimos 3 dias", shortLabel: "3d" },
  { value: 7, label: "Últimos 7 dias", shortLabel: "7d" },
  { value: 15, label: "Últimos 15 dias", shortLabel: "15d" },
  { value: 30, label: "Últimos 30 dias", shortLabel: "30d" },
  { value: 60, label: "Últimos 60 dias", shortLabel: "60d" },
  { value: 90, label: "Últimos 90 dias", shortLabel: "90d" },
];

export default function DashboardPage() {
  const user = useContext(UserContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<'online' | 'offline' | 'loading'>('loading');
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodOption>(periodOptions[0]);
  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Array<{
    orderId: number;
    status: string;
    buyerRobloxUsername: string;
    robuxAmount: number;
    finalPrice: number;
    createdAt: string;
  }>>([]);

  useEffect(() => {
    loadData();
    checkBotStatus();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod]);

  const loadData = async () => {
    try {
      setLoading(true);
      const ordersResponse = await api.get("/api/orders/my") as { data: { orders?: unknown[] } | unknown[] };
      const orders = Array.isArray(ordersResponse.data) 
        ? ordersResponse.data 
        : (ordersResponse.data?.orders || []);
      
      // Calculate period start date
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - selectedPeriod.value);
      periodStart.setHours(0, 0, 0, 0);
      
      interface OrderData {
        orderId?: number;
        status?: string;
        createdAt?: string;
        paidAt?: string;
        finalPrice?: number;
        robuxAmount?: number;
        buyerRobloxUsername?: string;
      }
      
      // Filter orders within selected period
      const periodOrders = (orders as OrderData[]).filter((o: OrderData) => {
        const orderDate = new Date(o.paidAt || o.createdAt || '');
        return orderDate >= periodStart;
      });
      
      // Only count DELIVERED or COMPLETED orders for revenue
      const completedOrders = periodOrders.filter((o: OrderData) => 
        o.status === 'DELIVERED' || o.status === 'COMPLETED'
      );
      
      const periodRevenue = completedOrders.reduce((acc: number, o: OrderData) => acc + (o.finalPrice || 0), 0);
      const pendingDeliveries = (orders as OrderData[]).filter((o: OrderData) => 
        o.status === 'PAYMENT_CONFIRMED' || o.status === 'ASSIGNED'
      ).length;
      const completedPeriod = completedOrders.length;
      
      // Get 5 most recent orders from period
      const recent = periodOrders
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 5)
        .map(o => ({
          orderId: o.orderId || 0,
          status: o.status || '',
          buyerRobloxUsername: o.buyerRobloxUsername || '',
          robuxAmount: o.robuxAmount || 0,
          finalPrice: o.finalPrice || 0,
          createdAt: o.createdAt || ''
        }));
      
      setRecentOrders(recent);
      setStats({
        periodOrders: periodOrders.length,
        periodRevenue,
        pendingDeliveries,
        completedPeriod
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      setStats({
        periodOrders: 0,
        periodRevenue: 0,
        pendingDeliveries: 0,
        completedPeriod: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const checkBotStatus = async () => {
    try {
      await api.getConfig();
      setBotStatus('online');
    } catch {
      setBotStatus('offline');
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bom dia";
    if (hour < 18) return "Boa tarde";
    return "Boa noite";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PAYMENT_PENDING: "text-yellow-400 bg-yellow-500/10",
      PAYMENT_CONFIRMED: "text-blue-400 bg-blue-500/10",
      ASSIGNED: "text-purple-400 bg-purple-500/10",
      DELIVERING: "text-orange-400 bg-orange-500/10",
      DELIVERED: "text-emerald-400 bg-emerald-500/10",
      COMPLETED: "text-emerald-400 bg-emerald-500/10",
      CANCELLED: "text-red-400 bg-red-500/10",
      EXPIRED: "text-zinc-400 bg-zinc-500/10"
    };
    return colors[status] || "text-zinc-400 bg-zinc-500/10";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PAYMENT_PENDING: "Aguardando",
      PAYMENT_CONFIRMED: "Pago",
      ASSIGNED: "Atribuído",
      DELIVERING: "Entregando",
      DELIVERED: "Entregue",
      COMPLETED: "Concluído",
      CANCELLED: "Cancelado",
      EXPIRED: "Expirado"
    };
    return labels[status] || status;
  };

  const formatTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}min`;
    if (diffHours < 24) return `${diffHours}h`;
    return `${diffDays}d`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Compact Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0] || 'Usuário'}</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        
        {/* Status Pills & Period Selector */}
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="relative">
            <motion.button
              onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800/80 border border-zinc-700/50 text-sm font-medium text-white hover:border-cyan-500/30 transition-all"
            >
              <Calendar className="w-4 h-4 text-cyan-400" />
              <span>{selectedPeriod.label}</span>
              <motion.div
                animate={{ rotate: periodDropdownOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-4 h-4 text-zinc-400" />
              </motion.div>
            </motion.button>

            <AnimatePresence>
              {periodDropdownOpen && (
                <>
                  {/* Backdrop */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setPeriodDropdownOpen(false)} 
                  />
                  
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 z-50 w-48 py-2 rounded-xl bg-zinc-900 border border-zinc-700/50 shadow-xl shadow-black/40"
                  >
                    {periodOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedPeriod(option);
                          setPeriodDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                          selectedPeriod.value === option.value
                            ? 'bg-cyan-500/10 text-cyan-400'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <span>{option.label}</span>
                        {selectedPeriod.value === option.value && (
                          <CheckCircle className="w-4 h-4" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* API Status */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
            botStatus === 'online' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : botStatus === 'offline'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
          }`}>
            {botStatus === 'online' ? (
              <><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> API Online</>
            ) : botStatus === 'offline' ? (
              <><AlertCircle className="w-3 h-3" /> API Offline</>
            ) : (
              <><Loader2 className="w-3 h-3 animate-spin" /> Verificando</>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards - Compact Grid */}
      <motion.div variants={item} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/dashboard/orders?status=pending" className="group">
          <div className="glass-card p-4 hover-card border-l-2 border-l-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wide">Pendentes</p>
                <p className="text-2xl font-bold text-white mt-1">{stats?.pendingDeliveries || 0}</p>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/10">
                <Clock className="w-5 h-5 text-amber-400" />
              </div>
            </div>
          </div>
        </Link>

        <div className="glass-card p-4 border-l-2 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                Faturamento
                <span className="text-cyan-400/70">({selectedPeriod.shortLabel})</span>
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                R$ {(stats?.periodRevenue || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 border-l-2 border-l-cyan-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                Pedidos
                <span className="text-cyan-400/70">({selectedPeriod.shortLabel})</span>
              </p>
              <p className="text-2xl font-bold text-white mt-1">{stats?.periodOrders || 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-cyan-500/10">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
        </div>

        <div className="glass-card p-4 border-l-2 border-l-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-zinc-500 uppercase tracking-wide flex items-center gap-1">
                Entregues
                <span className="text-cyan-400/70">({selectedPeriod.shortLabel})</span>
              </p>
              <p className="text-2xl font-bold text-white mt-1">{stats?.completedPeriod || 0}</p>
            </div>
            <div className="p-2 rounded-lg bg-purple-500/10">
              <CheckCircle className="w-5 h-5 text-purple-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <motion.div variants={item} className="lg:col-span-2">
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Pedidos Recentes
                <span className="text-xs font-normal text-zinc-500">
                  ({selectedPeriod.label.toLowerCase()})
                </span>
              </h2>
              <Link href="/dashboard/orders" className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                Ver todos <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            
            {recentOrders.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum pedido ainda</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <Link 
                    key={order.orderId} 
                    href={`/dashboard/orders?id=${order.orderId}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/60 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center text-xs font-mono text-zinc-400">
                        #{order.orderId}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
                          {order.buyerRobloxUsername}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {order.robuxAmount.toLocaleString()} R$ • R$ {order.finalPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-xs text-zinc-600">
                        {formatTimeAgo(order.createdAt)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={item}>
          <div className="glass-card p-5">
            <h2 className="font-semibold text-white flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              Ações Rápidas
            </h2>
            
            <div className="space-y-2">
              {stats?.pendingDeliveries ? (
                <Link href="/dashboard/orders?status=pending" className="block">
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span className="text-sm font-medium text-amber-200">
                          {stats.pendingDeliveries} entregas pendentes
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ) : null}
              
              <Link href="/dashboard/config" className="block">
                <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-300">Personalizar Bot</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <Link href="/dashboard/integrations" className="block">
                <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-300">Integrações</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
              
              <Link href="/dashboard/coupons" className="block">
                <div className="p-3 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 transition-colors group flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-zinc-400" />
                    <span className="text-sm text-zinc-300">Gerenciar Cupons</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
