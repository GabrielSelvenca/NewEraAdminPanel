"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, CheckCircle, Clock, RefreshCw, Truck } from "lucide-react";
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

const statusColors: Record<string, string> = {
  PAYMENT_PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  PAYMENT_CONFIRMED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  ASSIGNED: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  DELIVERING: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  DELIVERED: "bg-green-500/20 text-green-400 border-green-500/30",
  COMPLETED: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",
  EXPIRED: "bg-zinc-500/20 text-zinc-400 border-zinc-500/30",
};

const statusLabels: Record<string, string> = {
  PAYMENT_PENDING: "Aguardando Pagamento",
  PAYMENT_CONFIRMED: "Pago - Aguardando Entrega",
  ASSIGNED: "Atribuído",
  DELIVERING: "Entregando",
  DELIVERED: "Entregue",
  COMPLETED: "Concluído",
  CANCELLED: "Cancelado",
  EXPIRED: "Expirado",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState<number | null>(null);
  const [filter, setFilter] = useState<string>("pending");

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/orders");
      const data = response.data as { orders?: Order[] } | Order[];
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
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
      const response = await api.post(`/api/orders/${orderId}/deliver`);
      if (response.data.success) {
        toast.success("Entrega realizada com sucesso!");
        loadOrders();
      } else {
        toast.error(response.data.message || "Falha na entrega");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erro ao entregar pedido");
    } finally {
      setDelivering(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "pending") {
      return order.status === "PAYMENT_CONFIRMED" || order.status === "ASSIGNED";
    }
    if (filter === "delivered") {
      return order.status === "DELIVERED" || order.status === "COMPLETED";
    }
    if (filter === "all") return true;
    return order.status === filter;
  });

  const pendingCount = orders.filter(
    (o) => o.status === "PAYMENT_CONFIRMED" || o.status === "ASSIGNED"
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Pedidos</h1>
          <p className="text-zinc-400 mt-1">Gerencie e entregue pedidos</p>
        </div>
        <Button onClick={loadOrders} variant="outline" className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{pendingCount}</p>
                <p className="text-sm text-zinc-400">Pendentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">
                  {orders.filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED").length}
                </p>
                <p className="text-sm text-zinc-400">Entregues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">{orders.length}</p>
                <p className="text-sm text-zinc-400">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 rounded-lg">
                <Package className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-100">
                  R$ {orders.filter((o) => o.status === "DELIVERED" || o.status === "COMPLETED").reduce((acc, o) => acc + o.finalPrice, 0).toFixed(2)}
                </p>
                <p className="text-sm text-zinc-400">Faturado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button
          variant={filter === "pending" ? "default" : "outline"}
          onClick={() => setFilter("pending")}
          className="gap-2"
        >
          <Clock className="w-4 h-4" />
          Pendentes ({pendingCount})
        </Button>
        <Button
          variant={filter === "delivered" ? "default" : "outline"}
          onClick={() => setFilter("delivered")}
          className="gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          Entregues
        </Button>
        <Button
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          Todos
        </Button>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Package className="w-5 h-5" />
            {filter === "pending" ? "Pedidos Pendentes" : filter === "delivered" ? "Pedidos Entregues" : "Todos os Pedidos"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-zinc-500" />
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400">Nenhum pedido encontrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.orderId}
                  className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-zinc-700/50 rounded-lg">
                      <Package className="w-5 h-5 text-zinc-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-zinc-100">
                          Pedido #{order.orderId}
                        </span>
                        <Badge className={statusColors[order.status] || "bg-zinc-500/20"}>
                          {statusLabels[order.status] || order.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-zinc-400 mt-1">
                        <span className="font-medium text-zinc-300">{order.buyerRobloxUsername}</span>
                        {" • "}
                        <span>{order.robuxAmount} Robux</span>
                        {" • "}
                        <span>R$ {order.finalPrice.toFixed(2)}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-1">
                        {order.paidAt
                          ? `Pago em ${new Date(order.paidAt).toLocaleString("pt-BR")}`
                          : `Criado em ${new Date(order.createdAt).toLocaleString("pt-BR")}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {order.gamepassId > 0 && (
                      <a
                        href={`https://www.roblox.com/game-pass/${order.gamepassId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Ver Gamepass
                      </a>
                    )}
                    {(order.status === "PAYMENT_CONFIRMED" || order.status === "ASSIGNED") && (
                      <Button
                        size="sm"
                        onClick={() => handleDeliver(order.orderId)}
                        disabled={delivering === order.orderId}
                        className="gap-2 bg-green-600 hover:bg-green-700"
                      >
                        {delivering === order.orderId ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Truck className="w-4 h-4" />
                        )}
                        Entregar
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
