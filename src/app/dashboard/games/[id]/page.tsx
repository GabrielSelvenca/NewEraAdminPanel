"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, Game, Product } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, Save, Trash2, Plus, Link as LinkIcon, Loader2, 
  Gamepad2, Package, RefreshCw, ImageIcon, Edit2, DollarSign,
  TrendingUp, TrendingDown, Minus, ShoppingCart, BarChart3
} from "lucide-react";
import Image from "next/image";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function GameEditPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = Number(params.id);

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshingImage, setRefreshingImage] = useState<number | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  // Dialogs
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Sync/Create states
  const [syncUrl, setSyncUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");
  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productRobux, setProductRobux] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [productActive, setProductActive] = useState(true);
  const [creatingProduct, setCreatingProduct] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);

  // Sales stats
  const [period, setPeriod] = useState<7 | 15 | 30>(7);
  const [salesStats, setSalesStats] = useState<{
    totalSales: number;
    totalRevenue: number;
    totalRobux: number;
    averageTicket: number;
    variation: number;
    salesByDay: { date: string; vendas: number; receita: number }[];
  } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const loadGame = async () => {
    try {
      setLoading(true);
      const data = await api.getGame(gameId);
      setGame(data);
      setName(data.name);
      setActive(data.active);
      setImageUrl(data.imageUrl || "");
    } catch (err) {
      console.error(err);
      router.push("/dashboard/games");
    } finally {
      setLoading(false);
    }
  };

  const loadSalesStats = async () => {
    try {
      setLoadingStats(true);
      const stats = await api.getSalesStats(period);
      setSalesStats(stats);
    } catch (err) {
      console.error("Erro ao carregar estatísticas:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => { if (gameId) loadGame(); }, [gameId]);
  useEffect(() => { loadSalesStats(); }, [period]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateGame(gameId, { name, active, imageUrl: imageUrl || undefined });
      await loadGame();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Deletar o jogo e todos os seus produtos?")) return;
    setDeleting(true);
    try {
      await api.deleteGame(gameId);
      router.push("/dashboard/games");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar");
      setDeleting(false);
    }
  };

  const handleSyncGamepass = async () => {
    if (!syncUrl.trim()) return;
    setSyncing(true);
    setError("");
    try {
      await api.importGamepass(gameId, syncUrl.trim());
      setSyncDialogOpen(false);
      setSyncUrl("");
      await loadGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar");
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!productName.trim()) return;
    setCreatingProduct(true);
    setError("");
    try {
      await api.createProduct({
        gameId, name: productName.trim(), description: productDescription || undefined,
        price: productPrice ? parseFloat(productPrice) : undefined,
        robuxAmount: productRobux ? parseInt(productRobux) : 0,
        type: 0, delivery: 0, active: true, displayOrder: (game?.products?.length || 0) + 1,
      });
      setProductDialogOpen(false);
      resetProductForm();
      await loadGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductName(product.name);
    setProductPrice(product.price?.toString() || "");
    setProductRobux(product.robuxAmount?.toString() || "");
    setProductDescription(product.description || "");
    setProductActive(product.active);
    setEditProductDialogOpen(true);
  };

  const handleSaveProduct = async () => {
    if (!selectedProduct || !productName.trim()) return;
    setSavingProduct(true);
    setError("");
    try {
      await api.updateProduct(selectedProduct.id, {
        name: productName.trim(),
        description: productDescription || undefined,
        price: productPrice ? parseFloat(productPrice) : undefined,
        robuxAmount: productRobux ? parseInt(productRobux) : 0,
        active: productActive,
      });
      setEditProductDialogOpen(false);
      resetProductForm();
      await loadGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: number, pName: string) => {
    if (!confirm(`Deletar "${pName}"?`)) return;
    try { await api.deleteProduct(productId); await loadGame(); }
    catch (err) { alert(err instanceof Error ? err.message : "Erro"); }
  };

  const handleRefreshImage = async (productId: number) => {
    setRefreshingImage(productId);
    try { await api.refreshProductImage(productId); await loadGame(); }
    catch (err) { alert(err instanceof Error ? err.message : "Erro"); }
    finally { setRefreshingImage(null); }
  };

  const resetProductForm = () => {
    setProductName(""); setProductPrice(""); setProductRobux("");
    setProductDescription(""); setProductActive(true); setSelectedProduct(null); setError("");
  };

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
          <p className="text-zinc-400 text-sm">Gerenciar jogo, produtos e visualizar vendas</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-5 h-5 text-zinc-500" />
            <span className={`text-xs px-2 py-0.5 rounded ${
              !salesStats?.variation || salesStats.variation === 0 
                ? 'bg-zinc-500/20 text-zinc-400' 
                : salesStats.variation > 0 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'bg-red-500/20 text-red-400'
            }`}>
              {!salesStats?.variation || salesStats.variation === 0 
                ? <Minus className="w-3 h-3 inline mr-1" />
                : salesStats.variation > 0 
                  ? <TrendingUp className="w-3 h-3 inline mr-1" /> 
                  : <TrendingDown className="w-3 h-3 inline mr-1" />
              }
              {salesStats?.variation?.toFixed(1) || 0}%
            </span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{salesStats?.totalSales || 0}</p>
          <p className="text-zinc-500 text-sm">Vendas ({period}d)</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-400">R$ {(salesStats?.totalRevenue || 0).toFixed(2)}</p>
          <p className="text-zinc-500 text-sm">Receita ({period}d)</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-100">R$ {(salesStats?.averageTicket || 0).toFixed(2)}</p>
          <p className="text-zinc-500 text-sm">Ticket Médio</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-zinc-500" />
          </div>
          <p className="text-2xl font-bold text-zinc-100">{game.products?.length || 0}</p>
          <p className="text-zinc-500 text-sm">Produtos Ativos</p>
        </div>
      </div>

      {/* Period Filter + Chart */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Vendas por Dia
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
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
            </div>
          ) : salesStats?.salesByDay && salesStats.salesByDay.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesStats.salesByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
                <YAxis stroke="#71717a" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="receita" stroke="#10b981" fill="#10b98133" strokeWidth={2} name="Receita (R$)" />
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
            <h3 className="font-semibold text-zinc-100">Configurações do Jogo</h3>
            <div className="space-y-3">
              <div>
                <Label className="text-zinc-400 text-xs">Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
              </div>
              <div>
                <Label className="text-zinc-400 text-xs">URL da Imagem</Label>
                <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-zinc-300">Ativo</Label>
                <Switch checked={active} onCheckedChange={setActive} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={saving} className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar
              </Button>
              <Button onClick={handleDelete} disabled={deleting} variant="destructive">
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="lg:col-span-2 bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produtos ({game.products?.length || 0})
            </h2>
            <div className="flex gap-2">
              <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                    <LinkIcon className="w-4 h-4 mr-2" />Importar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-100">Importar Gamepass</DialogTitle>
                    <DialogDescription className="text-zinc-400">Cole o link ou ID da gamepass do Roblox</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input placeholder="https://www.roblox.com/game-pass/123456" value={syncUrl} onChange={(e) => setSyncUrl(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100" />
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <Button onClick={handleSyncGamepass} disabled={syncing || !syncUrl.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                      {syncing ? "Importando..." : "Importar"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={productDialogOpen} onOpenChange={(open) => { setProductDialogOpen(open); if (!open) resetProductForm(); }}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300">
                    <Plus className="w-4 h-4 mr-2" />Criar
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-zinc-900 border-zinc-800">
                  <DialogHeader>
                    <DialogTitle className="text-zinc-100">Criar Produto</DialogTitle>
                    <DialogDescription className="text-zinc-400">Preencha os dados do novo produto</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div><Label className="text-zinc-300">Nome</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><Label className="text-zinc-300">Preço (R$)</Label><Input type="number" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
                      <div><Label className="text-zinc-300">Robux</Label><Input type="number" value={productRobux} onChange={(e) => setProductRobux(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
                    </div>
                    <div><Label className="text-zinc-300">Descrição</Label><Input value={productDescription} onChange={(e) => setProductDescription(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
                    {error && <p className="text-red-400 text-sm">{error}</p>}
                    <Button onClick={handleCreateProduct} disabled={creatingProduct || !productName.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      {creatingProduct ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}Criar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Edit Product Dialog */}
          <Dialog open={editProductDialogOpen} onOpenChange={(open) => { setEditProductDialogOpen(open); if (!open) resetProductForm(); }}>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Editar Produto</DialogTitle>
                <DialogDescription className="text-zinc-400">Altere os dados do produto</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div><Label className="text-zinc-300">Nome</Label><Input value={productName} onChange={(e) => setProductName(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-zinc-300">Preço (R$)</Label><Input type="number" step="0.01" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
                  <div><Label className="text-zinc-300">Robux</Label><Input type="number" value={productRobux} onChange={(e) => setProductRobux(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
                </div>
                <div><Label className="text-zinc-300">Descrição</Label><Input value={productDescription} onChange={(e) => setProductDescription(e.target.value)} className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1" /></div>
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Produto Ativo</Label>
                  <Switch checked={productActive} onCheckedChange={setProductActive} />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button onClick={handleSaveProduct} disabled={savingProduct || !productName.trim()} className="w-full bg-emerald-600 hover:bg-emerald-700">
                  {savingProduct ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}Salvar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {!game.products || game.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
              <Package className="w-10 h-10 mb-3" />
              <p>Nenhum produto cadastrado</p>
            </div>
          ) : (
            <div className="space-y-2">
              {game.products.map((product) => (
                <div key={product.id} className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-3 group hover:bg-zinc-800 transition-colors">
                  <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.name} width={48} height={48} className="object-cover" unoptimized />
                    ) : (
                      <Package className="w-5 h-5 text-zinc-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-zinc-100 truncate">{product.name}</p>
                    <div className="flex items-center gap-2 text-sm">
                      {product.price && <span className="text-emerald-400">R$ {product.price.toFixed(2)}</span>}
                      {product.robuxAmount > 0 && <span className="text-yellow-400">{product.robuxAmount} R$</span>}
                      {!product.active && <span className="text-red-400 text-xs">(Inativo)</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {product.robloxGamepassId && !product.imageUrl && (
                      <Button variant="ghost" size="sm" onClick={() => handleRefreshImage(product.id)} disabled={refreshingImage === product.id} className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200" title="Atualizar imagem">
                        {refreshingImage === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />}
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => handleEditProduct(product)} className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-200" title="Editar">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteProduct(product.id, product.name)} className="h-8 w-8 p-0 text-red-400 hover:text-red-300" title="Deletar">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
