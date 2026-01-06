"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { 
  Package, CheckCircle, Clock, RefreshCw, Truck, 
  Search, Filter, ExternalLink, ChevronDown, AlertCircle,
  DollarSign, Loader2
} from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "sonner";

interface Order {
  orderId: number;
  status: string;
  buyerRobloxUsername: string;
  buyerRobloxId: number;
  buyerDiscordId?: string;
  gamepassId: number;
  gamepassUrl?: string;
  robuxAmount: number;
  finalPrice: number;
  createdAt: string;
  paidAt?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PAYMENT_PENDING: { label: "Aguardando", color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
  PAYMENT_CONFIRMED: { label: "Pago", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
  ASSIGNED: { label: "Atribuído", color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20" },
  DELIVERING: { label: "Entregando", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" },
  DELIVERED: { label: "Entregue", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  COMPLETED: { label: "Concluído", color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  CANCELLED: { label: "Cancelado", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" },
  EXPIRED: { label: "Expirado", color: "text-zinc-400", bg: "bg-zinc-500/10 border-zinc-500/20" },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("pending");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/orders/my");
      const data = response.data as { orders?: Order[] } | Order[];
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch {
      toast.error("Erro ao carregar pedidos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDeliver = async (orderId: number) => {
    setDelivering(orderId);
    try {
      const response = await api.post(`/api/orders/${orderId}/deliver`) as { data: Record<string, unknown> };
      const data = response.data as { success?: boolean; message?: string };
      if (data.success) {
        toast.success("Entrega realizada!");
        loadOrders();
      } else {
        toast.error(data.message || "Falha na entrega");
      }
    } catch {
      toast.error("Erro ao entregar pedido");
    } finally {
      setDelivering(null);
    }
  };

  const handleManualDeliver = async (orderId: number) => {
    if (!confirm("Confirmar entrega manual?\n\nVerifique se você realmente comprou o gamepass.")) {
      return;
    }
    
    setDelivering(orderId);
    try {
      const response = await api.post(`/api/orders/${orderId}/deliver-manual`);
      const data = response.data as { success?: boolean; message?: string };
      if (data.success) {
        toast.success("Entrega confirmada!");
        loadOrders();
      } else {
        toast.error(data.message || "Erro na entrega");
      }
    } catch {
      toast.error("Erro ao confirmar entrega");
    } finally {
      setDelivering(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    // Filter by status
    if (filter === "pending" && !["PAYMENT_CONFIRMED", "ASSIGNED"].includes(order.status)) return false;
    if (filter === "delivered" && !["DELIVERED", "COMPLETED"].includes(order.status)) return false;
    if (filter !== "all" && filter !== "pending" && filter !== "delivered" && order.status !== filter) return false;
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        order.buyerRobloxUsername.toLowerCase().includes(searchLower) ||
        order.orderId.toString().includes(searchLower)
      );
    }
    return true;
  });

  const stats = {
    pending: orders.filter(o => ["PAYMENT_CONFIRMED", "ASSIGNED"].includes(o.status)).length,
    delivered: orders.filter(o => ["DELIVERED", "COMPLETED"].includes(o.status)).length,
    total: orders.length,
    revenue: orders
      .filter(o => ["PAYMENT_CONFIRMED", "DELIVERED", "COMPLETED"].includes(o.status))
      .reduce((acc, o) => acc + o.finalPrice, 0)
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <motion.div 
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Package className="w-6 h-6 text-cyan-400" />
            Pedidos
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Gerencie e entregue pedidos</p>
        </div>
        <Button 
          onClick={loadOrders} 
          variant="outline" 
          size="sm"
          className="border-zinc-700 hover:bg-zinc-800"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </motion.div>

      {/* Stats Bar */}
      <motion.div variants={item} className="grid grid-cols-4 gap-3">
        <button 
          onClick={() => setFilter("pending")}
          className={`glass-card p-3 text-left transition-all ${filter === "pending" ? "border-amber-500/50 bg-amber-500/5" : ""}`}
        >
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-zinc-500 uppercase">Pendentes</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.pending}</p>
        </button>
        
        <button 
          onClick={() => setFilter("delivered")}
          className={`glass-card p-3 text-left transition-all ${filter === "delivered" ? "border-emerald-500/50 bg-emerald-500/5" : ""}`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase">Entregues</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.delivered}</p>
        </button>
        
        <button 
          onClick={() => setFilter("all")}
          className={`glass-card p-3 text-left transition-all ${filter === "all" ? "border-cyan-500/50 bg-cyan-500/5" : ""}`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-zinc-500 uppercase">Total</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
        </button>
        
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase">Faturado</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">R$ {stats.revenue.toFixed(0)}</p>
        </div>
      </motion.div>

      {/* Search & Filter Bar */}
      <motion.div variants={item} className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Buscar por username ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-zinc-800/50 border-zinc-700"
          />
        </div>
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`border-zinc-700 ${showFilters ? "bg-zinc-800" : ""}`}
        >
          <Filter className="w-4 h-4" />
        </Button>
      </motion.div>

      {/* Filter Pills */}
      {showFilters && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="flex flex-wrap gap-2"
        >
          {Object.entries(statusConfig).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                filter === key 
                  ? `${config.bg} ${config.color}` 
                  : "bg-zinc-800/50 text-zinc-400 border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              {config.label}
            </button>
          ))}
        </motion.div>
      )}

      {/* Orders List */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-zinc-500">Nenhum pedido encontrado</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {filteredOrders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.EXPIRED;
              const isPending = ["PAYMENT_CONFIRMED", "ASSIGNED"].includes(order.status);
              
              return (
                <motion.div
                  key={order.orderId}
                  variants={item}
                  className="p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <span className="text-xs font-mono text-zinc-400">#{order.orderId}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{order.buyerRobloxUsername}</span>
                          <Badge className={`${status.bg} ${status.color} text-xs border`}>
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                          <span>{order.robuxAmount.toLocaleString()} R$</span>
                          <span>•</span>
                          <span>R$ {order.finalPrice.toFixed(2)}</span>
                          <span>•</span>
                          <span>{formatDate(order.paidAt || order.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {order.gamepassId > 0 && (
                        <a
                          href={`https://www.roblox.com/game-pass/${order.gamepassId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
                          title="Ver Gamepass"
                        >
                          <ExternalLink className="w-4 h-4 text-zinc-500" />
                        </a>
                      )}
                      
                      {isPending && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={() => handleDeliver(order.orderId)}
                            disabled={delivering === order.orderId}
                            className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3"
                          >
                            {delivering === order.orderId ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <Truck className="w-3 h-3 mr-1" />
                                Entregar
                              </>
                            )}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManualDeliver(order.orderId)}
                            disabled={delivering === order.orderId}
                            className="border-zinc-700 hover:bg-zinc-800 px-2"
                            title="Marcar como entregue"
                          >
                            <CheckCircle className="w-3 h-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Results count */}
      {!loading && filteredOrders.length > 0 && (
        <motion.p variants={item} className="text-xs text-zinc-600 text-center">
          Exibindo {filteredOrders.length} de {orders.length} pedidos
        </motion.p>
      )}
    </motion.div>
  );
}
