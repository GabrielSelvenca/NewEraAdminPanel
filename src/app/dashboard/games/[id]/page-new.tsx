"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "@/lib/error-handling";
import { api, Game } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { 
  ArrowLeft, Save, Trash2, Plus, Link as LinkIcon, Loader2, 
  Gamepad2, Package, RefreshCw, ImageIcon
} from "lucide-react";
import Image from "next/image";

export default function GameEditPage() {
  const router = useRouter();
  const params = useParams();
  const gameId = Number(params.id);

  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
  const [refreshingImage, setRefreshingImage] = useState<number | null>(null);

  const loadGame = async () => {
    try {
      setLoading(true);
      const data = await api.getGame(gameId);
      setGame(data);
      setName(data.name);
      setActive(data.active);
      setImageUrl(data.imageUrl || "");
    } catch {
      router.push("/dashboard/games");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gameId) loadGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.updateGame(gameId, { name, active, imageUrl: imageUrl || undefined });
      toast.success("Jogo atualizado com sucesso");
      await loadGame();
    } catch (err) {
      toast.error("Erro ao salvar", err instanceof Error ? err.message : undefined);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Deletar o jogo "${game?.name}" e todos os seus produtos? Esta ação não pode ser desfeita.`)) return;
    setDeleting(true);
    try {
      await api.deleteGame(gameId);
      toast.success("Jogo deletado com sucesso");
      router.push("/dashboard/games");
    } catch (err) {
      toast.error("Erro ao deletar", err instanceof Error ? err.message : undefined);
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
      toast.success("Produto deletado com sucesso");
      await loadGame();
    } catch (err) {
      toast.error("Erro ao deletar produto", err instanceof Error ? err.message : undefined);
    }
  };

  const handleRefreshProductImage = async (productId: number) => {
    setRefreshingImage(productId);
    try {
      await api.refreshProductImage(productId);
      toast.success("Imagem atualizada com sucesso");
      await loadGame();
    } catch (err) {
      toast.error("Erro ao atualizar imagem", err instanceof Error ? err.message : undefined);
    } finally {
      setRefreshingImage(null);
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
                      {product.robloxGamepassId && !product.imageUrl && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRefreshProductImage(product.id)}
                          disabled={refreshingImage === product.id}
                          className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-700 h-8 w-8 p-0"
                          title="Atualizar imagem do Roblox"
                        >
                          {refreshingImage === product.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <ImageIcon className="w-4 h-4" />
                          )}
                        </Button>
                      )}
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
