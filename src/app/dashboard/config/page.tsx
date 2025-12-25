"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, FolderOpen, Hash, Palette, Image as ImageIcon, MessageSquare, DollarSign, Trash2, Plus, Eye, RefreshCw, Settings, Store } from "lucide-react";
import { DiscordEmbedPreview } from "@/components/discord-embed-preview";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { isFeatureEnabled } from "@/lib/feature-toggle";

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
  const [games, setGames] = useState<{ name: string; active: boolean }[]>([]);
  const gamesEnabled = isFeatureEnabled('gamesEnabled');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Só carrega config e games se jogos estiverem habilitados
      if (gamesEnabled) {
        const [configData, discordData, gamesData] = await Promise.all([
          api.getConfig(),
          api.getDiscordServerData().catch(() => null),
          api.getGames().catch(() => []),
        ]);
        setConfig(configData);
        setServerData(discordData);
        setGames(gamesData.filter((g: { active: boolean }) => g.active));
        
        if (configData.tierRoles) {
          try {
            setTierRoles(JSON.parse(configData.tierRoles));
          } catch {
            setTierRoles([]);
          }
        }
      } else {
        const discordData = await api.getDiscordServerData().catch(() => null);
        setServerData(discordData);
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
      
      // Notifica o bot automaticamente após salvar
      await api.notifyBotUpdate();
      
      setMessage("✅ Configurações salvas! Bot será atualizado automaticamente em até 10 segundos.");
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Erro ao salvar"}`);
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSaving(true);
    setMessage("");
    try {
      await api.notifyBotUpdate();
      setMessage("✅ Bot notificado! Use o comando /sync no Discord para aplicar as mudanças.");
      setTimeout(() => setMessage(""), 5000);
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Erro ao sincronizar"}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BotConfig, value: string | number | boolean) => {
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
        <div className="flex gap-2">
          <Button onClick={handleSync} disabled={saving} variant="outline" className="border-blue-600 text-blue-400 hover:bg-blue-600/10">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
            Sincronizar Bot
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {saving ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes("✅") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message}
        </div>
      )}

      {/* Accordion com Subsections */}
      <Accordion type="multiple" defaultValue={["store", "discord", "visual"]} className="space-y-4">
        
        {/* Configurações da Loja */}
        <AccordionItem value="store" className="bg-zinc-900 border-zinc-800 rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-500" />
              Configurações da Loja
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome da Loja</Label>
                  <Input
                    value={config.storeName || ""}
                    onChange={(e) => updateField("storeName", e.target.value)}
                    className="bg-zinc-800 border-zinc-700"
                    placeholder="Nova Era Store"
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

              {/* Toggles de Habilitação */}
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <h3 className="font-semibold text-zinc-200">Disponibilidade de Vendas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Vendas de Gamepass</Label>
                      <p className="text-sm text-zinc-400">Permitir compras de gamepasses</p>
                    </div>
                    <Switch
                      checked={config.gamepassEnabled !== false}
                      onCheckedChange={(checked) => updateField("gamepassEnabled", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-zinc-800/50 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-base">Vendas de Robux</Label>
                      <p className="text-sm text-zinc-400">Permitir compras de robux</p>
                    </div>
                    <Switch
                      checked={config.robuxEnabled !== false}
                      onCheckedChange={(checked) => updateField("robuxEnabled", checked)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Discord - Categorias e Canais */}
        <AccordionItem value="discord" className="bg-zinc-900 border-zinc-800 rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Settings className="w-5 h-5 text-blue-500" />
              Discord - Categorias e Canais
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              {/* Categorias */}
              <div>
                <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  Categorias
                </h3>
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
              </div>

              {/* Canais */}
              <div className="pt-4 border-t border-zinc-800">
                <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Canais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { field: "channelPurchasesLog", label: "Compras Concluídas (Log)" },
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
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Visual e Mensagens */}
        <AccordionItem value="visual" className="bg-zinc-900 border-zinc-800 rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-500" />
              Visual e Mensagens dos Embeds
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              {/* Cor Global */}
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

              {/* Banners */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              </div>

              {/* Mensagens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-800">
                <div className="space-y-2">
                  <Label>Mensagem Embed Gamepass</Label>
                  <Textarea
                    value={config.embedGamepassMessage || ""}
                    onChange={(e) => updateField("embedGamepassMessage", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                    placeholder="Use {games-list} e {status-gamepass}"
                  />
                  <p className="text-xs text-zinc-500">Placeholders: {'{games-list}'}, {'{status-gamepass}'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Mensagem Embed Robux</Label>
                  <Textarea
                    value={config.embedRobuxMessage || ""}
                    onChange={(e) => updateField("embedRobuxMessage", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 min-h-[100px]"
                    placeholder="Use {status-robux}"
                  />
                  <p className="text-xs text-zinc-500">Placeholder: {'{status-robux}'}</p>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Cargos por Valor */}
        <AccordionItem value="roles" className="bg-zinc-900 border-zinc-800 rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-500" />
              Cargos por Valor de Compra
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-zinc-400">Cargos automáticos baseados no total gasto</p>
                <Button onClick={addTierRole} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                  <Plus className="w-4 h-4 mr-1" />
                  Adicionar
                </Button>
              </div>
              {tierRoles.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Nenhum cargo configurado</p>
              ) : (
                <div className="space-y-3">
                  {tierRoles.map((tier, index) => (
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
                  ))}
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Preview dos Embeds - Mantém fora do Accordion */}
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

      {/* Preview dos Embeds */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-500" />
            Visual dos Embeds
          </CardTitle>
          <CardDescription>Preview de como os embeds aparecerão no Discord</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview Gamepass */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Embed Gamepass</Label>
              <DiscordEmbedPreview
                title={config.storeName || "Nova Era Store"}
                description={config.embedGamepassMessage || "Bem-vindo à **{store-name}**! Selecione um jogo abaixo:\n\n{games-list}\n\n{status-gamepass}"}
                color={config.storeColor || "#257e24"}
                thumbnailUrl={config.bannerGamepass}
                footerText={`${config.storeName || "Nova Era Store"} • Compre com segurança`}
                timestamp={true}
                storeName={config.storeName || "Nova Era Store"}
                gamesList={games.map(g => g.name)}
                pricePerK={config.pricePerK || 27.99}
                status={config.gamepassEnabled !== false ? "🟢 Disponível" : "🔴 Indisponível"}
              />
            </div>

            {/* Preview Robux */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Embed Robux</Label>
              <DiscordEmbedPreview
                title={config.storeName || "Nova Era Store"}
                description={config.embedRobuxMessage || "Compre Robux com *segurança*!\n\nExemplo: **1000 Robux** custa __{robux-price 1000}__\n\n{status-robux}"}
                color={config.storeColor || "#257e24"}
                thumbnailUrl={config.bannerRobux}
                footerText={`${config.storeName || "Nova Era Store"} • Compre com segurança`}
                timestamp={true}
                storeName={config.storeName || "Nova Era Store"}
                gamesList={games.map(g => g.name)}
                pricePerK={config.pricePerK || 27.99}
                status={config.robuxEnabled !== false ? "🟢 Disponível" : "🔴 Indisponível"}
              />
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
