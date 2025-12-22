"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, FolderOpen, Hash, Palette, Image as ImageIcon, MessageSquare, DollarSign, Trash2, Plus } from "lucide-react";

interface DiscordServerData {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  categories: { id: string; name: string }[];
  textChannels: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}

interface TierRole {
  minValue: number;
  roleId: string;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [serverData, setServerData] = useState<DiscordServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [tierRoles, setTierRoles] = useState<TierRole[]>([]);

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
      
      if (configData.tierRoles) {
        try {
          setTierRoles(JSON.parse(configData.tierRoles));
        } catch {
          setTierRoles([]);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage("");
    try {
      const configToSave = {
        ...config,
        tierRoles: JSON.stringify(tierRoles)
      };
      await api.updateConfig(configToSave);
      setMessage("✅ Configurações salvas! Embeds de setup serão atualizados automaticamente.");
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Erro ao salvar"}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BotConfig, value: string | number) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const addTierRole = () => {
    setTierRoles([...tierRoles, { minValue: 0, roleId: "" }]);
  };

  const removeTierRole = (index: number) => {
    setTierRoles(tierRoles.filter((_, i) => i !== index));
  };

  const updateTierRole = (index: number, field: keyof TierRole, value: string | number) => {
    const newTiers = [...tierRoles];
    newTiers[index] = { ...newTiers[index], [field]: value };
    setTierRoles(newTiers);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Configurações do Bot</h1>
          <p className="text-zinc-400 mt-1">Configure categorias, canais, visual e cargos</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes("✅") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message}
        </div>
      )}

      {/* Categorias Discord */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-blue-500" />
            Categorias do Discord
          </CardTitle>
          <CardDescription>Onde os carrinhos serão criados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { field: "categoryCartsGamepass", label: "Carrinhos Gamepass" },
              { field: "categoryCartsRobux", label: "Carrinhos Robux" },
              { field: "categoryApproved", label: "Aprovados" }
            ].map(({ field, label }) => (
              <div key={field} className="space-y-2">
                <Label>{label}</Label>
                {serverData ? (
                  <Select
                    value={config[field as keyof BotConfig] as string || ""}
                    onValueChange={(value) => updateField(field as keyof BotConfig, value)}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Selecione categoria" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {serverData.categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={config[field as keyof BotConfig] as string || ""}
                    onChange={(e) => updateField(field as keyof BotConfig, e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="ID da categoria"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Canais Discord */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-purple-500" />
            Canais do Discord
          </CardTitle>
          <CardDescription>Logs e embeds de setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { field: "channelPurchasesLog", label: "Compras Concluídas (Log Pagamentos)" },
              { field: "channelDeliveriesLog", label: "Entregas Concluídas" },
              { field: "channelSetupGamepass", label: "Setup Embed Gamepass" },
              { field: "channelSetupRobux", label: "Setup Embed Robux" }
            ].map(({ field, label }) => (
              <div key={field} className="space-y-2">
                <Label className="text-sm">{label}</Label>
                {serverData ? (
                  <Select
                    value={config[field as keyof BotConfig] as string || ""}
                    onValueChange={(value) => updateField(field as keyof BotConfig, value)}
                  >
                    <SelectTrigger className="bg-zinc-800 border-zinc-700">
                      <SelectValue placeholder="Selecione canal" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      {serverData.textChannels.map((ch) => (
                        <SelectItem key={ch.id} value={ch.id}>
                          # {ch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={config[field as keyof BotConfig] as string || ""}
                    onChange={(e) => updateField(field as keyof BotConfig, e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="ID do canal"
                  />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Visual & Mensagens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-500" />
              Visual dos Embeds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Cor Global dos Embeds</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={config.storeColor || "#257e24"}
                  onChange={(e) => updateField("storeColor", e.target.value)}
                  className="w-16 h-10 p-1 bg-zinc-800 border-zinc-700 cursor-pointer"
                />
                <Input
                  value={config.storeColor || "#257e24"}
                  onChange={(e) => updateField("storeColor", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Banner Embed Gamepass
              </Label>
              <Input
                value={config.bannerGamepass || ""}
                onChange={(e) => updateField("bannerGamepass", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                placeholder="https://exemplo.com/banner-gamepass.png"
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Banner Embed Robux
              </Label>
              <Input
                value={config.bannerRobux || ""}
                onChange={(e) => updateField("bannerRobux", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
                placeholder="https://exemplo.com/banner-robux.png"
              />
            </div>
          </CardContent>
        </Card>

        {/* Mensagens */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-500" />
              Mensagens dos Embeds
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Mensagem Embed Gamepass</Label>
              <Textarea
                value={config.embedGamepassMessage || ""}
                onChange={(e) => updateField("embedGamepassMessage", e.target.value)}
                className="bg-zinc-800 border-zinc-700 min-h-[80px]"
                placeholder="Bem-vindo à loja de Gamepasses! Selecione um jogo abaixo..."
              />
            </div>

            <div className="space-y-2">
              <Label>Mensagem Embed Robux</Label>
              <Textarea
                value={config.embedRobuxMessage || ""}
                onChange={(e) => updateField("embedRobuxMessage", e.target.value)}
                className="bg-zinc-800 border-zinc-700 min-h-[80px]"
                placeholder="Compre Robux com segurança! Clique no botão abaixo..."
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cargos por Valor */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-yellow-500" />
                Cargos por Valor de Compra
              </CardTitle>
              <CardDescription>Cargos automáticos baseados no total gasto</CardDescription>
            </div>
            <Button onClick={addTierRole} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tierRoles.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">Nenhum cargo configurado</p>
          ) : (
            tierRoles.map((tier, index) => (
              <div key={index} className="flex items-end gap-4 p-4 bg-zinc-800/50 rounded-lg">
                <div className="flex-1 space-y-2">
                  <Label>Valor Mínimo (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={tier.minValue}
                    onChange={(e) => updateTierRole(index, "minValue", parseFloat(e.target.value) || 0)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label>Cargo</Label>
                  {serverData ? (
                    <Select
                      value={tier.roleId}
                      onValueChange={(value) => updateTierRole(index, "roleId", value)}
                    >
                      <SelectTrigger className="bg-zinc-800 border-zinc-700">
                        <SelectValue placeholder="Selecione cargo" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 border-zinc-700">
                        {serverData.roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      value={tier.roleId}
                      onChange={(e) => updateTierRole(index, "roleId", e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="ID do cargo"
                    />
                  )}
                </div>
                <Button
                  onClick={() => removeTierRole(index)}
                  size="sm"
                  variant="destructive"
                  className="mb-0.5"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Info sobre Store Name e PreçoPerK */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle>Configurações da Loja</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome da Loja</Label>
              <Input
                value={config.storeName || ""}
                onChange={(e) => updateField("storeName", e.target.value)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label>Preço por 1000 Robux (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={config.pricePerK || 0}
                onChange={(e) => updateField("pricePerK", parseFloat(e.target.value) || 0)}
                className="bg-zinc-800 border-zinc-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
