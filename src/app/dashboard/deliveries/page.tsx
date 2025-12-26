"use client";

import { useEffect, useState } from "react";
import { api, Delivery } from "@/lib/api";
import { toast } from "@/lib/error-handling";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Package, Loader2, CheckCircle, Clock, XCircle, TrendingUp } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Stats {
  total: number;
  pending: number;
  inProgress: number;
  completed: number;
  failed: number;
  totalValue: number;
  avgDeliveryTimeMinutes: number;
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [proofUrl, setProofUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [deliveriesData, statsData] = await Promise.all([
        api.getDeliveries(filter !== 'all' ? filter : undefined),
        api.getDeliveryStats(),
      ]);
      setDeliveries(deliveriesData);
      setStats(statsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      setUpdating(true);
      await api.updateDeliveryStatus(id, {
        status,
        proofUrl: status === 'completed' ? proofUrl : undefined,
        notes: notes || undefined,
      });
      setShowModal(false);
      setProofUrl("");
      setNotes("");
      setSelectedDelivery(null);
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status", err instanceof Error ? err.message : undefined);
    } finally {
      setUpdating(false);
    }
  };

  const openDeliveryModal = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setProofUrl(delivery.proofUrl || "");
    setNotes(delivery.notes || "");
    setShowModal(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'in_progress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'failed': return <XCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Progresso';
      case 'completed': return 'Concluída';
      case 'failed': return 'Falhou';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Entregas</h1>
        <p className="text-zinc-400 mt-1">Gerencie todas as entregas de Robux e Gamepasses</p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Total</p>
                  <p className="text-2xl font-bold text-zinc-100">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-zinc-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Pendentes</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending}</p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Concluídas</p>
                  <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-400">Tempo Médio</p>
                  <p className="text-2xl font-bold text-blue-400">{Math.round(stats.avgDeliveryTimeMinutes || 0)}m</p>
                </div>
                <TrendingUp className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label>Filtrar por Status</Label>
              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="bg-zinc-800 border-zinc-700">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="completed">Concluídas</SelectItem>
                  <SelectItem value="failed">Falhadas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Entregas */}
      <div className="grid grid-cols-1 gap-4">
        {deliveries.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center text-zinc-500">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nenhuma entrega encontrada
            </CardContent>
          </Card>
        ) : (
          deliveries.map((delivery) => (
            <Card key={delivery.id} className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {delivery.type === 'robux' ? '💎' : '🎮'} {delivery.robloxUsername}
                      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded border ${getStatusColor(delivery.status)}`}>
                        {getStatusIcon(delivery.status)}
                        {getStatusLabel(delivery.status)}
                      </span>
                    </CardTitle>
                    <p className="text-sm text-zinc-400 mt-1">
                      ID: #{delivery.id} • Criado: {new Date(delivery.createdAt).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Tipo</p>
                    <p className="text-zinc-100 font-medium">{delivery.type === 'robux' ? 'Robux' : 'Gamepass'}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Quantidade</p>
                    <p className="text-zinc-100 font-medium">
                      {delivery.robuxAmount ? `${delivery.robuxAmount} Robux` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Valor</p>
                    <p className="text-zinc-100 font-medium">R$ {delivery.value.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-zinc-500">Roblox ID</p>
                    <p className="text-zinc-100 font-medium">{delivery.robloxUserId || 'N/A'}</p>
                  </div>
                </div>

                {delivery.notes && (
                  <div className="bg-zinc-800/50 rounded p-3">
                    <p className="text-xs text-zinc-500 mb-1">Observações:</p>
                    <p className="text-sm text-zinc-300">{delivery.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {delivery.status === 'pending' && (
                    <Button
                      onClick={() => updateStatus(delivery.id, 'in_progress')}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Iniciar Entrega
                    </Button>
                  )}
                  
                  {delivery.status === 'in_progress' && (
                    <Button
                      onClick={() => openDeliveryModal(delivery)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Concluir
                    </Button>
                  )}

                  {delivery.proofUrl && (
                    <Button
                      onClick={() => window.open(delivery.proofUrl, '_blank')}
                      size="sm"
                      variant="outline"
                    >
                      Ver Comprovante
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Modal de Conclusão */}
      {showModal && selectedDelivery && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-zinc-900 border-zinc-800 w-full max-w-md">
            <CardHeader>
              <CardTitle>Concluir Entrega #{selectedDelivery.id}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>URL do Comprovante (Opcional)</Label>
                <Input
                  value={proofUrl}
                  onChange={(e) => setProofUrl(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="https://imgur.com/..."
                />
              </div>

              <div className="space-y-2">
                <Label>Observações (Opcional)</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 min-h-[80px]"
                  placeholder="Detalhes sobre a entrega..."
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => updateStatus(selectedDelivery.id, 'completed')}
                  disabled={updating}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {updating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                  Confirmar
                </Button>
                <Button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedDelivery(null);
                    setProofUrl("");
                    setNotes("");
                  }}
                  variant="outline"
                  disabled={updating}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
