"use client";

import { useEffect, useState } from "react";
import { api, Game } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Trash2, Link as LinkIcon, Gamepad2, Loader2 } from "lucide-react";
import NextLink from "next/link";

export default function GamesPage() {
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
      await api.syncRoblox(syncUrl.trim());
      setSyncDialogOpen(false);
      setSyncUrl("");
      await loadGames();
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
      await api.createGame({ name: gameName.trim(), active: true });
      setManualDialogOpen(false);
      setGameName("");
      await loadGames();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar jogo");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Deletar o jogo "${name}" e todos os seus produtos?`)) return;
    try {
      await api.deleteGame(id);
      await loadGames();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao deletar");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Jogos</h1>
          <p className="text-zinc-400 mt-1">Gerencie seus jogos e produtos</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={syncDialogOpen} onOpenChange={setSyncDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <LinkIcon className="w-4 h-4 mr-2" />
                Sincronizar do Roblox
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
                    placeholder="https://www.roblox.com/games/123456789 ou apenas o ID"
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

          <Button variant="outline" onClick={loadGames} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : games.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Gamepad2 className="w-12 h-12 mb-4" />
              <p>Nenhum jogo cadastrado</p>
              <p className="text-sm">Clique em &quot;Sincronizar do Roblox&quot; para adicionar</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">ID</TableHead>
                  <TableHead className="text-zinc-400">Nome</TableHead>
                  <TableHead className="text-zinc-400">Universe ID</TableHead>
                  <TableHead className="text-zinc-400">Produtos</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.map((game) => (
                  <TableRow key={game.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-zinc-300">{game.id}</TableCell>
                    <TableCell>
                      <NextLink 
                        href={`/dashboard/games/${game.id}`}
                        className="text-emerald-500 hover:text-emerald-400 font-medium"
                      >
                        {game.name}
                      </NextLink>
                    </TableCell>
                    <TableCell className="text-zinc-400">{game.robloxGameId || "-"}</TableCell>
                    <TableCell className="text-zinc-300">{game.products?.length || 0}</TableCell>
                    <TableCell>
                      <Badge variant={game.active ? "default" : "secondary"} 
                        className={game.active ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-400"}>
                        {game.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(game.id, game.name)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
