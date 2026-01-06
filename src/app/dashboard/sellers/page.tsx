"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { 
  Users, UserCheck, UserX, RefreshCw, Loader2, 
  ChevronDown, ChevronRight, Check, X, Settings2
} from "lucide-react";
import { toast } from "@/lib/error-handling";

interface Seller {
  id: number;
  username: string;
  discordId?: string;
  robloxBalance: number;
  auxiliaresCount: number;
}

interface Auxiliar {
  id: number;
  username: string;
  discordId?: string;
  sellersCount: number;
}

interface SellerWithAuxiliares extends Seller {
  auxiliares: { relationId: number; auxiliarId: number; auxiliarUsername?: string; active: boolean }[];
  expanded?: boolean;
}

export default function SellersAuxiliaresPage() {
  const [sellers, setSellers] = useState<SellerWithAuxiliares[]>([]);
  const [auxiliares, setAuxiliares] = useState<Auxiliar[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar sellers e auxiliares
      const [sellersRes, auxiliaresRes] = await Promise.all([
        api.get<Seller[]>('/api/seller-auxiliares/sellers'),
        api.get<Auxiliar[]>('/api/seller-auxiliares/auxiliares'),
      ]);

      const sellersData = sellersRes.data;
      const auxiliaresData = auxiliaresRes.data;

      // Para cada seller, carregar seus auxiliares
      const sellersWithAux: SellerWithAuxiliares[] = await Promise.all(
        sellersData.map(async (seller) => {
          try {
            const auxRes = await api.get<{ auxiliares: { relationId: number; auxiliarId: number; auxiliarUsername?: string; active: boolean }[] }>(
              `/api/seller-auxiliares/by-seller/${seller.id}`
            );
            return { ...seller, auxiliares: auxRes.data.auxiliares || [], expanded: false };
          } catch {
            return { ...seller, auxiliares: [], expanded: false };
          }
        })
      );

      setSellers(sellersWithAux);
      setAuxiliares(auxiliaresData);
    } catch {
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleExpand = (sellerId: number) => {
    setSellers(prev => 
      prev.map(s => s.id === sellerId ? { ...s, expanded: !s.expanded } : s)
    );
  };

  const handleToggleAuxiliar = async (sellerId: number, auxiliarId: number, currentlyLinked: boolean) => {
    setSaving(auxiliarId);
    try {
      if (currentlyLinked) {
        // Encontrar relationId e remover
        const seller = sellers.find(s => s.id === sellerId);
        const relation = seller?.auxiliares.find(a => a.auxiliarId === auxiliarId);
        if (relation) {
          await api.delete(`/api/seller-auxiliares/${relation.relationId}`);
        }
      } else {
        // Adicionar
        await api.post('/api/seller-auxiliares', { sellerId, auxiliarId });
      }
      await loadData();
      toast.success(currentlyLinked ? "Auxiliar removido" : "Auxiliar adicionado");
    } catch (err) {
      toast.error("Erro ao atualizar", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(null);
    }
  };

  const isAuxiliarLinked = (seller: SellerWithAuxiliares, auxiliarId: number) => {
    return seller.auxiliares.some(a => a.auxiliarId === auxiliarId && a.active !== false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Sellers & Auxiliares</h1>
          <p className="text-zinc-400 mt-1">Configure quais auxiliares podem entregar para cada seller</p>
        </div>
        <Button variant="outline" onClick={loadData} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{sellers.length}</p>
              <p className="text-zinc-500 text-sm">Sellers Ativos</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-100">{auxiliares.length}</p>
              <p className="text-zinc-500 text-sm">Auxiliares Ativos</p>
            </div>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Settings2 className="w-5 h-5 text-blue-400 mt-0.5" />
          <div>
            <p className="text-blue-300 font-medium">Como funciona:</p>
            <ul className="text-blue-300/80 text-sm mt-1 space-y-1">
              <li>• <strong>Sellers</strong> podem entregar Robux e itens de jogos</li>
              <li>• <strong>Auxiliares</strong> só podem entregar itens de jogos</li>
              <li>• Cada seller pode escolher quais auxiliares podem fazer entregas em seu nome</li>
              <li>• O Round-Robin considera ambos para distribuição de entregas</li>
            </ul>
          </div>
        </div>
      </div>

      {sellers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-zinc-500 bg-zinc-900 rounded-xl border border-zinc-800">
          <UserX className="w-10 h-10 mb-3" />
          <p>Nenhum seller cadastrado</p>
          <p className="text-sm">Crie sellers na página de Usuários</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sellers.map((seller) => (
            <div key={seller.id} className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
              {/* Seller Header */}
              <button
                onClick={() => toggleExpand(seller.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-zinc-800/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-zinc-100">{seller.username}</p>
                  <p className="text-zinc-500 text-sm">
                    {seller.robloxBalance.toLocaleString()} Robux • {seller.auxiliares.filter(a => a.active !== false).length} auxiliares
                  </p>
                </div>
                {seller.expanded ? (
                  <ChevronDown className="w-5 h-5 text-zinc-500" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-zinc-500" />
                )}
              </button>

              {/* Auxiliares List */}
              {seller.expanded && (
                <div className="border-t border-zinc-800 p-4 bg-zinc-950/50">
                  <p className="text-zinc-400 text-sm mb-3">Selecione os auxiliares autorizados:</p>
                  {auxiliares.length === 0 ? (
                    <p className="text-zinc-500 text-sm">Nenhum auxiliar disponível</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {auxiliares.map((aux) => {
                        const isLinked = isAuxiliarLinked(seller, aux.id);
                        const isSaving = saving === aux.id;
                        
                        return (
                          <button
                            key={aux.id}
                            onClick={() => handleToggleAuxiliar(seller.id, aux.id, isLinked)}
                            disabled={isSaving}
                            className={`p-3 rounded-lg border transition-all flex items-center gap-3 ${
                              isLinked 
                                ? 'bg-emerald-500/10 border-emerald-500/50 hover:bg-emerald-500/20' 
                                : 'bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded flex items-center justify-center flex-shrink-0 ${
                              isLinked ? 'bg-emerald-500' : 'bg-zinc-700'
                            }`}>
                              {isSaving ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                              ) : isLinked ? (
                                <Check className="w-4 h-4 text-white" />
                              ) : (
                                <X className="w-4 h-4 text-zinc-400" />
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className={`font-medium truncate ${isLinked ? 'text-emerald-300' : 'text-zinc-300'}`}>
                                {aux.username}
                              </p>
                              {aux.discordId && (
                                <p className="text-zinc-500 text-xs truncate">Discord: {aux.discordId}</p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
