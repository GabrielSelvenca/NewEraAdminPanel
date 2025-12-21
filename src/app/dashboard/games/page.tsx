"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Game } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, RefreshCw, Link as LinkIcon, Gamepad2, Loader2, DollarSign, ShoppingCart, Pencil } from "lucide-react";
import Image from "next/image";

export default function GamesPage() {
  const router = useRouter();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [syncUrl, setSyncUrl] = useState("");
  const [gameName, setGameName] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const loadGames = async () => {
    try {
      setLoading(true);
      const data = await api.getGames();
      setGames(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGames();
  }, []);

  const handleSync = async () => {
    if (!syncUrl.trim()) return;
    setSyncing(true);
    setError("");
    try {
      const result = await api.syncRoblox(syncUrl.trim());
      setSyncDialogOpen(false);
      setSyncUrl("");
      await loadGames();
      if (result.game) {
        router.push(`/dashboard/games/${result.game.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  };

  const handleCreateManual = async () => {
    if (!gameName.trim()) return;
    setCreating(true);
    setError("");
    try {
      const game = await api.createGame({ name: gameName.trim(), active: true });
      setManualDialogOpen(false);
      setGameName("");
      router.push(`/dashboard/games/${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar jogo");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Jogos</h1>
          <p className="text-zinc-400 mt-1">Gerencie seus jogos e produtos</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <LinkIcon className="w-4 h-4 mr-2" />
                Sincronizar Roblox
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Sincronizar do Roblox</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Link ou ID do jogo</Label>
                  <Input
                    placeholder="https://www.roblox.com/games/123456789"
                    value={syncUrl}
                    onChange={(e) => setSyncUrl(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button 
                  onClick={handleSync} 
                  disabled={syncing || !syncUrl.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                  {syncing ? "Sincronizando..." : "Sincronizar"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Plus className="w-4 h-4 mr-2" />
                Criar Manual
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Criar Jogo Manualmente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Nome do Jogo</Label>
                  <Input
                    placeholder="Nome do jogo"
                    value={gameName}
                    onChange={(e) => setGameName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button 
                  onClick={handleCreateManual} 
                  disabled={creating || !gameName.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {creating ? "Criando..." : "Criar Jogo"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={loadGames} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 px-3">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : games.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-500 bg-zinc-900 rounded-xl border border-zinc-800">
          <Gamepad2 className="w-12 h-12 mb-4" />
          <p>Nenhum jogo cadastrado</p>
          <p className="text-sm">Clique em &quot;Sincronizar Roblox&quot; para adicionar</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {games.map((game) => (
            <div
              key={game.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-zinc-700 transition-colors group"
            >
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
                    <Gamepad2 className="w-12 h-12 text-zinc-700" />
                  </div>
                )}
                {!game.active && (
                  <div className="absolute top-2 right-2 bg-zinc-900/80 px-2 py-1 rounded text-xs text-zinc-400">
                    Inativo
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-zinc-100 truncate mb-3">{game.name}</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-zinc-800/50 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                      <ShoppingCart className="w-3 h-3" />
                      Vendas
                    </div>
                    <p className="text-zinc-100 font-semibold">{game.totalSales || 0}</p>
                  </div>
                  <div className="bg-zinc-800/50 rounded-lg p-2">
                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs mb-1">
                      <DollarSign className="w-3 h-3" />
                      Receita
                    </div>
                    <p className="text-emerald-400 font-semibold">
                      R$ {(game.totalRevenue || 0).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push(`/dashboard/games/${game.id}`)}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-100"
                >
                  <Pencil className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
