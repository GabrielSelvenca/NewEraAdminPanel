"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, Hash, AlertCircle, DollarSign, Gamepad2 } from "lucide-react";
import Link from "next/link";

interface DiscordServerData {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  categories: { id: string; name: string }[];
  textChannels: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}

export default function ConfigGamesPage() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [serverData, setServerData] = useState<DiscordServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, discordData] = await Promise.all([
        api.getConfig(),
        api.getDiscordServerData().catch(() => null),
      ]);
      setConfig(configData);
      setServerData(discordData);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage("");
    try {
      // Envia apenas o canal de setup de gamepass
      await api.updateConfig({
        channelSetupGamepass: config.channelSetupGamepass,
      });
      await api.notifyBotUpdate();
      setMessage("✅ Canal de setup salvo! Bot será atualizado automaticamente em até 10 segundos.");
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Erro ao salvar"}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BotConfig, value: string) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!config) {
    return <div className="text-center text-zinc-500 py-12">Erro ao carregar configurações</div>;
  }

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-4">
        <Link href="/dashboard/config">
          <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
            <DollarSign className="w-4 h-4 mr-2" />
            Robux
          </Button>
        </Link>
        <Link href="/dashboard/config/games">
          <Button variant="default" className="bg-emerald-600 hover:bg-emerald-700">
            <Gamepad2 className="w-4 h-4 mr-2" />
            Jogos (Gamepass)
          </Button>
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Configurações - Jogos</h1>
        <p className="text-zinc-400 mt-2">Configure o canal de setup para jogos (outras opções em breve)</p>
      </div>

      {/* Alerta informativo */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-blue-400 font-medium">Funcionalidade Limitada</p>
            <p className="text-blue-300 text-sm mt-1">
              Por enquanto, você pode apenas configurar o <strong>canal de setup</strong>. 
              O bot enviará uma mensagem &quot;Em breve&quot; neste canal até que os jogos sejam habilitados.
              Outras configurações de jogos estarão disponíveis em breve.
            </p>
          </div>
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-zinc-100">
            <Hash className="w-5 h-5 text-emerald-500" />
            Canal de Setup
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Canal de Setup de Jogos</Label>
              <p className="text-sm text-zinc-500">
                Canal onde será enviada a mensagem de setup para compra de gamepasses
              </p>
              {serverData ? (
                <Select
                  value={config.channelSetupGamepass || ""}
                  onValueChange={(value) => updateField("channelSetupGamepass", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue placeholder="Selecione o canal" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {serverData.textChannels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        #{channel.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-zinc-500">Carregando canais...</p>
              )}
            </div>

            {message && (
              <div className={`p-3 rounded-lg ${message.startsWith("✅") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                {message}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Canal
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
