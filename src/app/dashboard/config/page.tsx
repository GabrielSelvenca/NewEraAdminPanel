"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2 } from "lucide-react";

export default function ConfigPage() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadConfig() {
      try {
        const data = await api.getConfig();
        setConfig(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadConfig();
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage("");
    try {
      await api.updateConfig(config);
      setMessage("Configurações salvas com sucesso!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BotConfig, value: string | number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center text-zinc-500 py-12">
        Erro ao carregar configurações
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Configurações</h1>
          <p className="text-zinc-400 mt-1">Configure o bot e a loja</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes("sucesso") ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Discord</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Guild ID (Servidor)</Label>
              <Input
                value={config.guildId || ""}
                onChange={(e) => updateField("guildId", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                placeholder="ID do servidor Discord"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Categoria Carrinhos</Label>
              <Input
                value={config.categoryCarts || ""}
                onChange={(e) => updateField("categoryCarts", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Categoria Aprovados</Label>
              <Input
                value={config.categoryApproved || ""}
                onChange={(e) => updateField("categoryApproved", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Canal de Logs</Label>
              <Input
                value={config.channelLogsPurchases || ""}
                onChange={(e) => updateField("channelLogsPurchases", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Cargo Admin</Label>
              <Input
                value={config.roleAdmin || ""}
                onChange={(e) => updateField("roleAdmin", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Cargo Cliente</Label>
              <Input
                value={config.roleClient || ""}
                onChange={(e) => updateField("roleClient", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Loja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Nome da Loja</Label>
              <Input
                value={config.storeName || ""}
                onChange={(e) => updateField("storeName", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
                placeholder="Nova Era Store"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Preço por 1000 Robux (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.pricePerK || 0}
                onChange={(e) => updateField("pricePerK", parseFloat(e.target.value) || 0)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Timeout Pagamento (min)</Label>
              <Input
                type="number"
                value={config.paymentTimeoutMinutes || 30}
                onChange={(e) => updateField("paymentTimeoutMinutes", parseInt(e.target.value) || 30)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Inatividade Carrinho (min)</Label>
              <Input
                type="number"
                value={config.cartInactivityMinutes || 60}
                onChange={(e) => updateField("cartInactivityMinutes", parseInt(e.target.value) || 60)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
