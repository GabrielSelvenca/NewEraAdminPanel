"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/lib/error-handling";
import { api, Game, GameItem } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, Save, Trash2, Plus, Loader2, 
  Gamepad2, Package, Edit2, DollarSign,
  TrendingUp, TrendingDown, Minus, ShoppingCart, BarChart3,
  Server, Settings, GripVertical, Eye, EyeOff
} from "lucide-react";
import Image from "next/image";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface GameStats {
  totalSales: number;
  totalRevenue: number;
  totalRobuxSold: number;
  periodSales: number;
  periodRevenue: number;
  periodRobux: number;
  salesByDay: { date: string; sales: number; revenue: number; robux: number }[];
}

export default function GameEditPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = Number(params.id);

  const [game, setGame] = useState<Game | null>(null);
  const [items, setItems] = useState<GameItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [requiresPrivateServer, setRequiresPrivateServer] = useState(false);
  const [privateServerLink, setPrivateServerLink] = useState("");
  const [splitPixEnabled, setSplitPixEnabled] = useState(false);

  // Item Dialogs
  const [itemDialogOpen, setItemDialogOpen] = useState(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<GameItem | null>(null);
  
  // Item Form states
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemImageUrl, setItemImageUrl] = useState("");
  const [itemPriceRobux, setItemPriceRobux] = useState("");
  const [itemActive, setItemActive] = useState(true);
  const [itemHasStockLimit, setItemHasStockLimit] = useState(false);
  const [itemDailyStockLimit, setItemDailyStockLimit] = useState("");
  const [creatingItem, setCreatingItem] = useState(false);
  const [savingItem, setSavingItem] = useState(false);
  const [deletingItem, setDeletingItem] = useState<number | null>(null);
  const [error, setError] = useState("");

  // Stats
  const [period, setPeriod] = useState<7 | 15 | 30>(7);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadGame = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getGame(gameId);
      setGame(data);
      setItems(data.items || []);
      setName(data.name);
      setDescription(data.description || "");
      setActive(data.active);
      setImageUrl(data.imageUrl || "");
      setBannerUrl(data.bannerUrl || "");
      setRequiresPrivateServer(data.requiresPrivateServer);
      setPrivateServerLink(data.privateServerLink || "");
      setSplitPixEnabled(data.splitPixEnabled);
    } catch {
      toast.error("Erro ao carregar jogo");
      router.push("/dashboard/games");
    } finally {
      setLoading(false);
    }
  }, [gameId, router]);

  const loadStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const data = await api.getGameStats(gameId, period);
      setStats(data);
    } catch {
      // Silencioso
    } finally {
      setLoadingStats(false);
    }
  }, [gameId, period]);

  useEffect(() => { if (gameId) loadGame(); }, [gameId, loadGame]);
  useEffect(() => { if (gameId) loadStats(); }, [gameId, period, loadStats]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateGame(gameId, { 
        name, 
        description: description || undefined,
        active, 
        imageUrl: imageUrl || undefined,
        bannerUrl: bannerUrl || undefined,
        requiresPrivateServer,
        privateServerLink: privateServerLink || undefined,
        splitPixEnabled,
      });
      toast.success("Jogo atualizado com sucesso");
      await loadGame();
    } catch (err) {
      toast.error("Erro ao salvar", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Desativar este jogo? Ele não será mais exibido para venda.")) return;
    setDeleting(true);
    try {
      await api.deleteGame(gameId);
      toast.success("Jogo desativado com sucesso");
      router.push("/dashboard/games");
    } catch (err) {
      toast.error("Erro ao desativar", err instanceof Error ? err.message : undefined);
      setDeleting(false);
    }
  };

  const resetItemForm = () => {
    setItemName(""); 
    setItemDescription(""); 
    setItemImageUrl("");
    setItemPriceRobux("");
    setItemActive(true);
    setItemHasStockLimit(false);
    setItemDailyStockLimit("");
    setSelectedItem(null); 
    setError("");
  };

  const handleCreateItem = async () => {
    if (!itemName.trim()) return;
    setCreatingItem(true);
    setError("");
    try {
      await api.createGameItem(gameId, {
        name: itemName.trim(),
        description: itemDescription || undefined,
        imageUrl: itemImageUrl || undefined,
        priceRobux: parseInt(itemPriceRobux) || 0,
        active: itemActive,
        hasStockLimit: itemHasStockLimit,
        dailyStockLimit: itemHasStockLimit && itemDailyStockLimit ? parseInt(itemDailyStockLimit) : undefined,
      });
      setItemDialogOpen(false);
      resetItemForm();
      toast.success("Item criado com sucesso");
      await loadGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar item");
    } finally {
      setCreatingItem(false);
    }
  };

  const handleEditItem = (item: GameItem) => {
    setSelectedItem(item);
    setItemName(item.name);
    setItemDescription(item.description || "");
    setItemImageUrl(item.imageUrl || "");
    setItemPriceRobux(item.priceRobux.toString());
    setItemActive(item.active);
    setItemHasStockLimit(item.hasStockLimit);
    setItemDailyStockLimit(item.dailyStockLimit?.toString() || "");
    setEditItemDialogOpen(true);
  };

  const handleSaveItem = async () => {
    if (!selectedItem || !itemName.trim()) return;
    setSavingItem(true);
    setError("");
    try {
      await api.updateGameItem(gameId, selectedItem.id, {
        name: itemName.trim(),
        description: itemDescription || undefined,
        imageUrl: itemImageUrl || undefined,
        priceRobux: parseInt(itemPriceRobux) || 0,
        active: itemActive,
        hasStockLimit: itemHasStockLimit,
        dailyStockLimit: itemHasStockLimit && itemDailyStockLimit ? parseInt(itemDailyStockLimit) : undefined,
      });
      setEditItemDialogOpen(false);
      resetItemForm();
      toast.success("Item atualizado com sucesso");
      await loadGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar item");
    } finally {
      setSavingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: number, itemNameToDelete: string) => {
    if (!confirm(`Desativar "${itemNameToDelete}"?`)) return;
    setDeletingItem(itemId);
    try {
      await api.deleteGameItem(gameId, itemId);
      toast.success("Item desativado com sucesso");
      await loadGame();
    } catch (err) {
      toast.error("Erro ao desativar", err instanceof Error ? err.message : undefined);
    } finally {
      setDeletingItem(null);
    }
  };

  const handleToggleItemActive = async (item: GameItem) => {
    try {
      await api.updateGameItem(gameId, item.id, { active: !item.active });
      await loadGame();
    } catch (err) {
      toast.error("Erro ao alterar status", err instanceof Error ? err.message : undefined);
    }
  };

  // Calculate variation
  const variation = stats?.periodSales && game?.totalSales 
    ? ((stats.periodSales / (game.totalSales - stats.periodSales || 1)) - 1) * 100 
    : 0;

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
    </div>
  );

  if (!game) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.push("/dashboard/games")} className="text-zinc-400 hover:text-zinc-100">
          <ArrowLeft className="w-4 h-4 mr-2" />Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-100">{game.name}</h1>
          <p className="text-zinc-400 text-sm">Gerenciar jogo, itens e visualizar vendas</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm ${game.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-500/20 text-zinc-400'}`}>
          {game.active ? 'Ativo' : 'Inativo'}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-5 h-5 text-zinc-500" />
            <span className={`text-xs px-2 py-0.5 rounded ${
              variation === 0 ? 'bg-zinc-500/20 text-zinc-400' 
                : variation > 0 ? 'bg-emerald-500/20 text-emerald-400' 
                : 'bg-red-500/20 text-red-400'
            }`}>
              {variation === 0 ? <Minus className="w-3 h-3 inline mr-1" />
                : variation > 0 ? <TrendingUp className="w-3 h-3 inline mr-1" /> 
                : <TrendingDown className="w-3 h-3 inline mr-1" />}
              {Math.abs(variation).toFixed(1)}%
            </span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{stats?.periodSales || 0}</p>
          <p className="text-zinc-500 text-sm">Vendas ({period}d)</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">R$ {(stats?.periodRevenue || 0).toFixed(2)}</p>
          <p className="text-zinc-500 text-sm">Receita ({period}d)</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-yellow-400">{(stats?.periodRobux || 0).toLocaleString()}</p>
          <p className="text-zinc-500 text-sm">Robux ({period}d)</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-100">{items.filter(i => i.active).length}/{items.length}</p>
          <p className="text-zinc-500 text-sm">Itens Ativos</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />Vendas por Dia
          </h3>
          <div className="flex gap-2">
            {([7, 15, 30] as const).map((d) => (
              <Button key={d} variant={period === d ? "default" : "outline"} size="sm"
                onClick={() => setPeriod(d)}
                className={period === d ? "bg-emerald-600" : "border-zinc-700 text-zinc-400"}>
                {d}d
              </Button>
            ))}
          </div>
        </div>
        <div className="h-64">
          {loadingStats ? (
            <div className="flex items-center justify-center h-full"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
          ) : stats?.salesByDay && stats.salesByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} tickFormatter={(v) => v.split('-').slice(1).join('/')} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fill="#10b98133" strokeWidth={2} name="Receita (R$)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-500">
              <BarChart3 className="w-12 h-12 mb-2 opacity-50" />
              <p>Nenhuma venda no período</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Game Settings */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="relative aspect-video bg-zinc-800">
            {game.imageUrl ? (
              <Image src={game.imageUrl} alt={game.name} fill className="object-cover" unoptimized />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Gamepad2 className="w-16 h-16 text-zinc-700" />
              </div>
            )}
          </div>
          <div className="p-4 space-y-4">
            <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
              <Settings className="w-4 h-4" />Configurações do Jogo
            </h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs">Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1 min-h-[60px]" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">URL da Imagem</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">URL do Banner (opcional)</Label>
                <Input value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
              </div>
              
              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-zinc-300">Servidor Privado</Label>
                    <p className="text-zinc-500 text-xs">Requer link do servidor para entrega</p>
                  </div>
                  <Switch checked={requiresPrivateServer} onCheckedChange={setRequiresPrivateServer} />
                </div>
                {requiresPrivateServer && (
                  <div>
                    <Label className="text-zinc-400 text-xs">Link do Servidor Privado</Label>
                    <Input value={privateServerLink} onChange={(e) => setPrivateServerLink(e.target.value)} placeholder="https://www.roblox.com/games/..." className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <Label className="text-zinc-300">Split PIX</Label>
                    <p className="text-zinc-500 text-xs">Dividir pagamento (em breve)</p>
                  </div>
                  <Switch checked={splitPixEnabled} onCheckedChange={setSplitPixEnabled} disabled />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
                <Label className="text-zinc-300">Jogo Ativo</Label>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar
              </Button>
              <Button onClick={handleDelete} disabled={deleting} variant="destructive">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Package className="w-5 h-5" />Itens / Gifts ({items.length})
            </h2>
            <Dialog open={itemDialogOpen} onOpenChange={(open) => { setItemDialogOpen(open); if (!open) resetItemForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-2" />Novo Item
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-zinc-100">Criar Item</DialogTitle>
                  <DialogDescription className="text-zinc-400">Configure o novo item/gift para venda</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label className="text-zinc-300">Nome do Item</Label>
                    <Input value={itemName} onChange={(e) => setItemName(e.target.value)} placeholder="Ex: 1000 Moedas, VIP Pass..." className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Descrição (opcional)</Label>
                    <Textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                  </div>
                  <div>
                    <Label className="text-zinc-300">URL da Imagem (opcional)</Label>
                    <Input value={itemImageUrl} onChange={(e) => setItemImageUrl(e.target.value)} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                  </div>
                  <div>
                    <Label className="text-zinc-300">Preço em Robux</Label>
                    <Input type="number" value={itemPriceRobux} onChange={(e) => setItemPriceRobux(e.target.value)} placeholder="500" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                    <p className="text-zinc-500 text-xs mt-1">O preço em R$ será calculado automaticamente</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-zinc-300">Estoque Limitado</Label>
                      <p className="text-zinc-500 text-xs">Limitar vendas diárias</p>
                    </div>
                    <Switch checked={itemHasStockLimit} onCheckedChange={setItemHasStockLimit} />
                  </div>
                  {itemHasStockLimit && (
                    <div>
                      <Label className="text-zinc-300">Limite Diário</Label>
                      <Input type="number" value={itemDailyStockLimit} onChange={(e) => setItemDailyStockLimit(e.target.value)} placeholder="10" className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                    </div>
                  )}
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <Button onClick={handleCreateItem} disabled={creatingItem || !itemName.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {creatingItem ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Criar Item
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Edit Item Dialog */}
          <Dialog open={editItemDialogOpen} onOpenChange={(open) => { setEditItemDialogOpen(open); if (!open) resetItemForm(); }}>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Editar Item</DialogTitle>
                <DialogDescription className="text-zinc-400">Altere as configurações do item</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-zinc-300">Nome do Item</Label>
                  <Input value={itemName} onChange={(e) => setItemName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-300">Descrição</Label>
                  <Textarea value={itemDescription} onChange={(e) => setItemDescription(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-300">URL da Imagem</Label>
                  <Input value={itemImageUrl} onChange={(e) => setItemImageUrl(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                </div>
                <div>
                  <Label className="text-zinc-300">Preço em Robux</Label>
                  <Input type="number" value={itemPriceRobux} onChange={(e) => setItemPriceRobux(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Estoque Limitado</Label>
                  <Switch checked={itemHasStockLimit} onCheckedChange={setItemHasStockLimit} />
                </div>
                {itemHasStockLimit && (
                  <div>
                    <Label className="text-zinc-300">Limite Diário</Label>
                    <Input type="number" value={itemDailyStockLimit} onChange={(e) => setItemDailyStockLimit(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Item Ativo</Label>
                  <Switch checked={itemActive} onCheckedChange={setItemActive} />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button onClick={handleSaveItem} disabled={savingItem || !itemName.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {savingItem ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
              <Package className="w-10 h-10 mb-3" />
              <p>Nenhum item cadastrado</p>
              <p className="text-sm">Clique em &quot;Novo Item&quot; para adicionar</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.id} className={`bg-zinc-800/50 rounded-lg p-3 flex items-center gap-3 group hover:bg-zinc-800 transition-colors ${!item.active ? 'opacity-60' : ''}`}>
                  <div className="cursor-grab text-zinc-600 hover:text-zinc-400">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {item.imageUrl ? (
                      <Image src={item.imageUrl} alt={item.name} width={48} height={48} className="object-cover" unoptimized />
                    ) : (
                      <Package className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-100 truncate">{item.name}</p>
                      {!item.active && <span className="text-xs bg-zinc-700 text-zinc-400 px-1.5 py-0.5 rounded">Inativo</span>}
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <span className="text-yellow-400">{item.priceRobux.toLocaleString()} R$</span>
                      {item.hasStockLimit && (
                        <span className="text-zinc-500">{item.availableToday ?? item.dailyStockLimit}/{item.dailyStockLimit} hoje</span>
                      )}
                      <span className="text-zinc-500">• {item.totalSales} vendas</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" onClick={() => handleToggleItemActive(item)} 
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200" title={item.active ? 'Desativar' : 'Ativar'}>
                      {item.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditItem(item)} 
                      className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteItem(item.id, item.name)} 
                      disabled={deletingItem === item.id}
                      className="h-8 w-8 p-0 text-red-400 hover:text-red-300" title="Deletar">
                      {deletingItem === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {game.requiresPrivateServer && (
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400">
                <Server className="w-4 h-4" />
                <span className="text-sm font-medium">Servidor Privado Configurado</span>
              </div>
              {game.privateServerLink && (
                <p className="text-blue-300/70 text-xs mt-1 truncate">{game.privateServerLink}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
