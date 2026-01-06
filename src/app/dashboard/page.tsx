"use client";

import { useContext, useEffect, useState } from "react";
import { UserContext } from "@/lib/user-context";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown,
  Package, 
  DollarSign, 
  Users, 
  Clock,
  ArrowUpRight,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  todayOrders: number;
  todayRevenue: number;
  pendingDeliveries: number;
  activeUsers: number;
  weeklyGrowth: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function DashboardPage() {
  const user = useContext(UserContext);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [botStatus, setBotStatus] = useState<'online' | 'offline' | 'loading'>('loading');

  useEffect(() => {
    loadStats();
    checkBotStatus();
  }, []);

  const loadStats = async () => {
    try {
      // Tentar buscar dados reais da API
      const ordersResponse = await api.get("/api/orders/my") as { data: { orders?: unknown[] } | unknown[] };
      const orders = Array.isArray(ordersResponse.data) 
        ? ordersResponse.data 
        : (ordersResponse.data?.orders || []);
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      interface OrderData {
        status?: string;
        createdAt?: string;
        paidAt?: string;
        finalPrice?: number;
      }
      
      const todayOrders = (orders as OrderData[]).filter((o: OrderData) => {
        const orderDate = new Date(o.paidAt || o.createdAt || '');
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      });
      
      const todayRevenue = todayOrders.reduce((acc: number, o: OrderData) => acc + (o.finalPrice || 0), 0);
      const pendingDeliveries = (orders as OrderData[]).filter((o: OrderData) => 
        o.status === 'PAYMENT_CONFIRMED' || o.status === 'ASSIGNED'
      ).length;
      
      setStats({
        todayOrders: todayOrders.length,
        todayRevenue: todayRevenue,
        pendingDeliveries: pendingDeliveries,
        activeUsers: 0, // Será implementado quando houver endpoint de sellers
        weeklyGrowth: 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      // Mostrar zeros quando não conseguir carregar
      setStats({
        todayOrders: 0,
        todayRevenue: 0,
        pendingDeliveries: 0,
        activeUsers: 0,
        weeklyGrowth: 0
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

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    change, 
    color,
    href 
  }: { 
    title: string; 
    value: string | number; 
    icon: React.ElementType; 
    change?: number;
    color: 'cyan' | 'emerald' | 'purple' | 'amber';
    href?: string;
  }) => {
    const colors = {
      cyan: {
        bg: 'from-cyan-500/20 to-cyan-600/5',
        icon: 'bg-cyan-500/20 text-cyan-400',
        border: 'border-cyan-500/20',
        glow: 'hover:shadow-cyan-500/10'
      },
      emerald: {
        bg: 'from-emerald-500/20 to-emerald-600/5',
        icon: 'bg-emerald-500/20 text-emerald-400',
        border: 'border-emerald-500/20',
        glow: 'hover:shadow-emerald-500/10'
      },
      purple: {
        bg: 'from-purple-500/20 to-purple-600/5',
        icon: 'bg-purple-500/20 text-purple-400',
        border: 'border-purple-500/20',
        glow: 'hover:shadow-purple-500/10'
      },
      amber: {
        bg: 'from-amber-500/20 to-amber-600/5',
        icon: 'bg-amber-500/20 text-amber-400',
        border: 'border-amber-500/20',
        glow: 'hover:shadow-amber-500/10'
      }
    };

    const colorScheme = colors[color];

    const CardContent = () => (
      <div className={`
        relative overflow-hidden rounded-2xl border ${colorScheme.border}
        bg-gradient-to-br ${colorScheme.bg} backdrop-blur-sm
        p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${colorScheme.glow}
      `}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-zinc-400 font-medium">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {change !== undefined && (
              <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span>{Math.abs(change)}%</span>
                <span className="text-zinc-500">vs semana passada</span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-xl ${colorScheme.icon}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        {href && (
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <ArrowUpRight className="w-5 h-5 text-zinc-400" />
          </div>
        )}
      </div>
    );

    if (href) {
      return (
        <Link href={href} className="group">
          <CardContent />
        </Link>
      );
    }

    return <CardContent />;
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
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="page-header">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-cyan-400 text-sm font-medium mb-2">
            <Zap className="w-4 h-4" />
            <span>NewEra Admin</span>
          </div>
          <h1 className="text-4xl font-bold text-white">
            {getGreeting()}, <span className="gradient-text">{user?.name || 'Usuário'}</span>!
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">
            Acompanhe suas vendas e gerencie o sistema
          </p>
        </div>
        
        {/* Status Indicators */}
        <div className="flex items-center gap-4 mt-6">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            botStatus === 'online' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : botStatus === 'offline'
                ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
          }`}>
            {botStatus === 'online' ? (
              <><CheckCircle className="w-4 h-4" /> Bot Online</>
            ) : botStatus === 'offline' ? (
              <><AlertCircle className="w-4 h-4" /> Bot Offline</>
            ) : (
              <><Loader2 className="w-4 h-4 animate-spin" /> Verificando...</>
            )}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            Cargo: <span className="capitalize">{user?.role}</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Pedidos Hoje" 
          value={stats?.todayOrders || 0} 
          icon={Package}
          color="cyan"
          href="/dashboard/orders"
        />
        <StatCard 
          title="Faturamento Hoje" 
          value={`R$ ${(stats?.todayRevenue || 0).toFixed(2)}`}
          icon={DollarSign}
          color="emerald"
          change={stats?.weeklyGrowth}
        />
        <StatCard 
          title="Entregas Pendentes" 
          value={stats?.pendingDeliveries || 0} 
          icon={Clock}
          color="amber"
          href="/dashboard/orders?status=pending"
        />
        <StatCard 
          title="Entregadores Ativos" 
          value={stats?.activeUsers || 0} 
          icon={Users}
          color="purple"
          href="/dashboard/users"
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/dashboard/config" className="group">
            <div className="glass-card p-6 hover-card flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/10 text-pink-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  Personalizar Bot
                </h3>
                <p className="text-sm text-zinc-400">Cores, mensagens e banners</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
            </div>
          </Link>

          <Link href="/dashboard/bot-settings" className="group">
            <div className="glass-card p-6 hover-card flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 text-amber-400">
                <Clock className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  Tempos & Limites
                </h3>
                <p className="text-sm text-zinc-400">Timeouts e configurações</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
            </div>
          </Link>

          <Link href="/dashboard/coupons" className="group">
            <div className="glass-card p-6 hover-card flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-400">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors">
                  Gerenciar Cupons
                </h3>
                <p className="text-sm text-zinc-400">Criar e editar cupons</p>
              </div>
              <ArrowUpRight className="w-5 h-5 text-zinc-500 group-hover:text-cyan-400 transition-colors" />
            </div>
          </Link>
        </div>
      </motion.div>

      {/* Info Banner */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 via-transparent to-emerald-500/10 p-6">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">Sistema NewEra v2.0</h3>
              <p className="text-zinc-400 mt-1">
                Todas as configurações do bot podem ser ajustadas em tempo real pelo painel.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link 
                href="/dashboard/config"
                className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-medium rounded-xl hover:opacity-90 transition-opacity"
              >
                Configurar Bot
              </Link>
            </div>
          </div>
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-gradient-to-br from-cyan-500/20 to-transparent rounded-full blur-2xl" />
        </div>
      </motion.div>
    </motion.div>
  );
}
