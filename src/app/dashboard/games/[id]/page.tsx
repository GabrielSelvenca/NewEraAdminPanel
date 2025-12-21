"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, Game } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, Save, Trash2, Plus, Link as LinkIcon, Loader2, 
  Gamepad2, Package, DollarSign, ShoppingCart, RefreshCw, TrendingUp, TrendingDown, Calendar
} from "lucide-react";
import Image from "next/image";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

// Mock data para gráficos (será substituído por dados reais da API)
const generateMockSalesData = (days: number) => {
  const data = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      vendas: Math.floor(Math.random() * 20) + 5,
      receita: Math.floor(Math.random() * 500) + 100,
    });
  }
  return data;
};

export default function GameEditPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = Number(params.id);

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [period, setPeriod] = useState<7 | 15 | 30>(7);
  const [salesData, setSalesData] = useState(generateMockSalesData(7));
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [active, setActive] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [productDialogOpen, setProductDialogOpen] = useState(false);
  const [syncUrl, setSyncUrl] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const [productName, setProductName] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productRobux, setProductRobux] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [creatingProduct, setCreatingProduct] = useState(false);

  // Atualiza dados do gráfico quando o período muda
  useEffect(() => {
    setSalesData(generateMockSalesData(period));
  }, [period]);

  // Calcula métricas
  const totalSales = salesData.reduce((acc, d) => acc + d.vendas, 0);
  const totalRevenue = salesData.reduce((acc, d) => acc + d.receita, 0);
  const avgSales = totalSales / salesData.length;
  
  // Calcula variação (comparando com período anterior)
  const halfPoint = Math.floor(salesData.length / 2);
  const recentSales = salesData.slice(halfPoint).reduce((acc, d) => acc + d.vendas, 0);
  const olderSales = salesData.slice(0, halfPoint).reduce((acc, d) => acc + d.vendas, 0);
  const variation = olderSales > 0 ? ((recentSales - olderSales) / olderSales) * 100 : 0;

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

  useEffect(() => {
    if (gameId) loadGame();
  }, [gameId]);

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
    if (!confirm(`Deletar o jogo "${game?.name}" e todos os seus produtos? Esta ação não pode ser desfeita.`)) return;
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
      setError(err instanceof Error ? err.message : "Erro ao importar gamepass");
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
        gameId,
        name: productName.trim(),
        description: productDescription || undefined,
        price: productPrice ? parseFloat(productPrice) : undefined,
        robuxAmount: productRobux ? parseInt(productRobux) : 0,
        type: 0,
        delivery: 0,
        active: true,
        displayOrder: (game?.products?.length || 0) + 1,
      });
      setProductDialogOpen(false);
      setProductName("");
      setProductPrice("");
      setProductRobux("");
      setProductDescription("");
      await loadGame();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar produto");
    } finally {
      setCreatingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Deletar o produto "${productName}"?`)) return;
    try {
      await api.deleteProduct(productId);
      await loadGame();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar produto");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!game) return null;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/games")}
          className="text-zinc-400 hover:text-zinc-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-zinc-100">{game.name}</h1>
          <p className="text-zinc-400 text-sm">Editar jogo e gerenciar produtos</p>
        </div>
      </div>

      {/* Métricas e Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Vendas ({period}d)</p>
              <p className="text-2xl font-bold text-zinc-100">{totalSales}</p>
            </div>
            <ShoppingCart className="w-8 h-8 text-zinc-700" />
          </div>
          <div className={`flex items-center gap-1 mt-2 text-sm ${variation >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {variation >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {Math.abs(variation).toFixed(1)}% vs período anterior
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Receita ({period}d)</p>
              <p className="text-2xl font-bold text-emerald-400">R$ {totalRevenue.toFixed(2)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-emerald-700" />
          </div>
          <div className="text-zinc-500 text-sm mt-2">
            Média: R$ {(totalRevenue / salesData.length).toFixed(2)}/dia
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Média Diária</p>
              <p className="text-2xl font-bold text-zinc-100">{avgSales.toFixed(1)}</p>
            </div>
            <Calendar className="w-8 h-8 text-zinc-700" />
          </div>
          <div className="text-zinc-500 text-sm mt-2">vendas por dia</div>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-zinc-400 text-sm">Produtos</p>
              <p className="text-2xl font-bold text-zinc-100">{game.products?.length || 0}</p>
            </div>
            <Package className="w-8 h-8 text-zinc-700" />
          </div>
          <div className="text-zinc-500 text-sm mt-2">ativos no catálogo</div>
        </div>
      </div>

      {/* Filtro de Período */}
      <div className="flex gap-2 mb-4">
        {([7, 15, 30] as const).map((d) => (
          <Button
            key={d}
            variant={period === d ? "default" : "outline"}
            size="sm"
            onClick={() => setPeriod(d)}
            className={period === d ? "bg-emerald-600" : "border-zinc-700 text-zinc-400"}
          >
            {d} dias
          </Button>
        ))}
        {selectedProduct !== null && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedProduct(null)}
            className="border-zinc-700 text-zinc-400 ml-auto"
          >
            Limpar filtro de produto
          </Button>
        )}
      </div>

      {/* Gráfico de Vendas */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 mb-6">
        <h3 className="text-zinc-100 font-semibold mb-4">Vendas por Dia</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                labelStyle={{ color: '#f4f4f5' }}
              />
              <Area type="monotone" dataKey="vendas" stroke="#10b981" fill="#10b98133" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Receita */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 mb-6">
        <h3 className="text-zinc-100 font-semibold mb-4">Receita por Dia (R$)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="date" stroke="#71717a" fontSize={12} />
              <YAxis stroke="#71717a" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                labelStyle={{ color: '#f4f4f5' }}
                formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']}
              />
              <Bar dataKey="receita" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações do Jogo */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
            <div className="relative aspect-video bg-zinc-800">
              {game.imageUrl ? (
                <Image
                  src={game.imageUrl}
                  alt={game.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Gamepad2 className="w-16 h-16 text-zinc-700" />
                </div>
              )}
            </div>
            <div className="p-4 space-y-4">
              <h3 className="font-semibold text-zinc-100">Configurações</h3>
              <div className="space-y-3">
                <div>
                  <Label className="text-zinc-400 text-xs">Nome</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div>
                  <Label className="text-zinc-400 text-xs">URL da Imagem</Label>
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-zinc-300">Ativo</Label>
                  <Switch checked={active} onCheckedChange={setActive} />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Salvar
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={deleting}
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Produtos */}
        <div className="lg:col-span-2">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Produtos ({game.products?.length || 0})
              </h2>
              <div className="flex gap-2">
                <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Importar Gamepass
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">Importar Gamepass do Roblox</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Link ou ID do Gamepass</Label>
                        <Input
                          placeholder="https://www.roblox.com/game-pass/123456789"
                          value={syncUrl}
                          onChange={(e) => setSyncUrl(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      {error && <p className="text-red-400 text-sm">{error}</p>}
                      <Button
                        onClick={handleSyncGamepass}
                        disabled={syncing || !syncUrl.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                        {syncing ? "Importando..." : "Importar"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                      <Plus className="w-4 h-4 mr-2" />
                      Criar Manual
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800">
                    <DialogHeader>
                      <DialogTitle className="text-zinc-100">Criar Produto</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Nome</Label>
                        <Input
                          placeholder="Nome do produto"
                          value={productName}
                          onChange={(e) => setProductName(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-zinc-300">Preço (R$)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={productPrice}
                            onChange={(e) => setProductPrice(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-zinc-100"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-zinc-300">Robux</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            value={productRobux}
                            onChange={(e) => setProductRobux(e.target.value)}
                            className="bg-zinc-800 border-zinc-700 text-zinc-100"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-zinc-300">Descrição</Label>
                        <Input
                          placeholder="Descrição opcional"
                          value={productDescription}
                          onChange={(e) => setProductDescription(e.target.value)}
                          className="bg-zinc-800 border-zinc-700 text-zinc-100"
                        />
                      </div>
                      {error && <p className="text-red-400 text-sm">{error}</p>}
                      <Button
                        onClick={handleCreateProduct}
                        disabled={creatingProduct || !productName.trim()}
                        className="w-full bg-emerald-600 hover:bg-emerald-700"
                      >
                        {creatingProduct ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                        {creatingProduct ? "Criando..." : "Criar Produto"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {!game.products || game.products.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-zinc-500">
                <Package className="w-10 h-10 mb-3" />
                <p>Nenhum produto cadastrado</p>
                <p className="text-sm">Importe um gamepass ou crie manualmente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {game.products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-zinc-800/50 rounded-lg p-3 flex items-center gap-3 group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-zinc-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <Package className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-100 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 text-sm">
                        {product.price && (
                          <span className="text-emerald-400">R$ {product.price.toFixed(2)}</span>
                        )}
                        {product.robuxAmount > 0 && (
                          <span className="text-yellow-400">{product.robuxAmount} R$</span>
                        )}
                        {!product.active && (
                          <span className="text-zinc-500 text-xs">(Inativo)</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id, product.name)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8 w-8 p-0"
                      >
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
    </div>
  );
}
