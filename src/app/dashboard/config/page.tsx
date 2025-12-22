"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, Server, Hash, Users, FolderOpen, Store, MessageSquare, Palette, Settings } from "lucide-react";
import { DiscordEmbedPreview } from "@/components/discord-embed-preview";

interface DiscordServerData {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  memberCount: number;
  categories: { id: string; name: string }[];
  textChannels: { id: string; name: string; parentId?: string }[];
  roles: { id: string; name: string; color: string; position: number }[];
  syncedAt: string;
}

export default function ConfigPage() {
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
      await api.updateConfig(config);
      setMessage("✅ Configurações salvas com sucesso!");
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Erro ao salvar"}`);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BotConfig, value: string | number | boolean) => {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Configurações</h1>
          <p className="text-zinc-400 mt-1">Gerencie todas as configurações do sistema</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          {saving ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.includes("✅") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {message}
        </div>
      )}

      {/* Server Status Card */}
      {serverData && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              {serverData.guildIcon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={serverData.guildIcon} alt="" className="w-16 h-16 rounded-full" />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 text-xl font-semibold text-zinc-100">
                  <Server className="w-5 h-5 text-emerald-500" />
                  {serverData.guildName}
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-4 h-4" /> {serverData.memberCount} membros
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FolderOpen className="w-4 h-4" /> {serverData.categories.length} categorias
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Hash className="w-4 h-4" /> {serverData.roles.length} cargos
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs Navigation */}
      <Tabs defaultValue="loja" className="space-y-6">
        <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
          <TabsTrigger value="loja" className="data-[state=active]:bg-emerald-600">
            <Store className="w-4 h-4 mr-2" />
            Loja
          </TabsTrigger>
          <TabsTrigger value="discord" className="data-[state=active]:bg-emerald-600">
            <Server className="w-4 h-4 mr-2" />
            Discord
          </TabsTrigger>
          <TabsTrigger value="mensagens" className="data-[state=active]:bg-emerald-600">
            <MessageSquare className="w-4 h-4 mr-2" />
            Mensagens & Embeds
          </TabsTrigger>
          <TabsTrigger value="avancado" className="data-[state=active]:bg-emerald-600">
            <Settings className="w-4 h-4 mr-2" />
            Avançado
          </TabsTrigger>
        </TabsList>

        {/* Tab: Loja */}
        <TabsContent value="loja" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-500" />
                Configurações da Loja
              </CardTitle>
              <CardDescription>Personalize os dados básicos da sua loja</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <Label>Cor da Loja (Embeds)</Label>
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
                      placeholder="#257e24"
                    />
                  </div>
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
                <div className="space-y-2">
                  <Label>Timeout de Pagamento (minutos)</Label>
                  <Input
                    type="number"
                    value={config.paymentTimeoutMinutes || 30}
                    onChange={(e) => updateField("paymentTimeoutMinutes", parseInt(e.target.value) || 30)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inatividade do Carrinho (minutos)</Label>
                  <Input
                    type="number"
                    value={config.cartInactivityMinutes || 60}
                    onChange={(e) => updateField("cartInactivityMinutes", parseInt(e.target.value) || 60)}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Discord */}
        <TabsContent value="discord" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Categorias */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-blue-500" />
                  Categorias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {["categoryCartsGamepass", "categoryCartsRobux", "categoryApproved", "categoryTickets"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label>
                      {field === "categoryCartsGamepass" && "Carrinhos Gamepass"}
                      {field === "categoryCartsRobux" && "Carrinhos Robux"}
                      {field === "categoryApproved" && "Aprovados"}
                      {field === "categoryTickets" && "Tickets"}
                    </Label>
                    {serverData ? (
                      <Select
                        value={config[field as keyof BotConfig] as string || ""}
                        onValueChange={(value) => updateField(field as keyof BotConfig, value)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Selecione uma categoria" />
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
              </CardContent>
            </Card>

            {/* Canais */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="w-5 h-5 text-purple-500" />
                  Canais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {["channelLogsPurchases", "channelLogsDeliveries", "channelSetup", "channelAnnouncements", "channelDeliveryAnnouncements"].map((field) => (
                  <div key={field} className="space-y-2">
                    <Label className="text-sm">
                      {field === "channelLogsPurchases" && "Logs de Compras"}
                      {field === "channelLogsDeliveries" && "Logs de Entregas"}
                      {field === "channelSetup" && "Setup (Embed de Vendas)"}
                      {field === "channelAnnouncements" && "Anúncios de Compras"}
                      {field === "channelDeliveryAnnouncements" && "Anúncios de Entregas"}
                    </Label>
                    {serverData ? (
                      <Select
                        value={config[field as keyof BotConfig] as string || ""}
                        onValueChange={(value) => updateField(field as keyof BotConfig, value)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Selecione um canal" />
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
              </CardContent>
            </Card>

            {/* Cargos */}
            <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-yellow-500" />
                  Cargos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {["roleAdmin", "roleClient"].map((field) => (
                    <div key={field} className="space-y-2">
                      <Label>
                        {field === "roleAdmin" && "Cargo de Admin"}
                        {field === "roleClient" && "Cargo de Cliente"}
                      </Label>
                      {serverData ? (
                        <Select
                          value={config[field as keyof BotConfig] as string || ""}
                          onValueChange={(value) => updateField(field as keyof BotConfig, value)}
                        >
                          <SelectTrigger className="bg-zinc-800 border-zinc-700">
                            <SelectValue placeholder="Selecione um cargo" />
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
                          value={config[field as keyof BotConfig] as string || ""}
                          onChange={(e) => updateField(field as keyof BotConfig, e.target.value)}
                          className="bg-zinc-800 border-zinc-700"
                          placeholder="ID do cargo"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Mensagens & Embeds */}
        <TabsContent value="mensagens" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Editor de Mensagens */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-blue-500" />
                  Mensagens Personalizadas
                </CardTitle>
                <CardDescription>Personalize as mensagens que o bot envia</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { field: "welcomeMessage", label: "Boas-vindas", placeholder: "Bem-vindo à {storeName}! 🎮" },
                  { field: "cartCreatedMessage", label: "Carrinho Criado", placeholder: "Seu carrinho foi criado! 🛒" },
                  { field: "paymentPendingMessage", label: "Aguardando Pagamento", placeholder: "Aguardando pagamento... ⏳" },
                  { field: "purchaseCompleteMessage", label: "Compra Concluída", placeholder: "Compra realizada com sucesso! ✅" }
                ].map(({ field, label, placeholder }) => (
                  <div key={field} className="space-y-2">
                    <Label>{label}</Label>
                    <Textarea
                      value={config[field as keyof BotConfig] as string || ""}
                      onChange={(e) => updateField(field as keyof BotConfig, e.target.value)}
                      className="bg-zinc-800 border-zinc-700 min-h-[80px]"
                      placeholder={placeholder}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Preview do Embed */}
            <Card className="bg-zinc-900 border-zinc-800 lg:sticky lg:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-500" />
                  Preview do Embed
                </CardTitle>
                <CardDescription>Veja como ficará no Discord</CardDescription>
              </CardHeader>
              <CardContent>
                <DiscordEmbedPreview
                  title={config.storeName || "Nova Era Store"}
                  description={`🎮 Bem-vindo à loja!\n\n${config.welcomeMessage || "Escolha seus produtos e finalize sua compra com segurança."}`}
                  color={config.storeColor || "#257e24"}
                  footerText={config.embedFooterText || "Nova Era Store • Robux com segurança"}
                  thumbnailUrl={config.embedThumbnailUrl || undefined}
                  timestamp={true}
                />
                
                <div className="mt-6 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-sm">Texto do Footer</Label>
                    <Input
                      value={config.embedFooterText || ""}
                      onChange={(e) => updateField("embedFooterText", e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="Nova Era Store • Robux com segurança"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm">URL da Thumbnail</Label>
                    <Input
                      value={config.embedThumbnailUrl || ""}
                      onChange={(e) => updateField("embedThumbnailUrl", e.target.value)}
                      className="bg-zinc-800 border-zinc-700"
                      placeholder="https://exemplo.com/logo.png"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Avançado */}
        <TabsContent value="avancado" className="space-y-6">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-500" />
                Configurações Avançadas
              </CardTitle>
              <CardDescription>Opções avançadas do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { field: "notifyOnPurchase", label: "Notificar Compras", desc: "Logs de compra" },
                  { field: "notifyOnDelivery", label: "Notificar Entregas", desc: "Logs de entrega" },
                  { field: "autoDeleteCarts", label: "Auto-deletar Carrinhos", desc: "Após inatividade" },
                  { field: "showPriceInEmbed", label: "Mostrar Preços", desc: "Nos embeds" }
                ].map(({ field, label, desc }) => (
                  <label key={field} className="flex items-start gap-3 p-4 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-750 border border-zinc-700">
                    <input
                      type="checkbox"
                      checked={config[field as keyof BotConfig] as boolean ?? true}
                      onChange={(e) => updateField(field as keyof BotConfig, e.target.checked)}
                      className="w-5 h-5 mt-0.5 accent-emerald-500"
                    />
                    <div>
                      <p className="text-zinc-100 font-medium">{label}</p>
                      <p className="text-zinc-500 text-sm">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Múltiplos Carrinhos */}
              <div className="space-y-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
                <h4 className="font-semibold text-zinc-100">Múltiplos Carrinhos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={config.allowMultipleCarts ?? true}
                      onChange={(e) => updateField("allowMultipleCarts", e.target.checked)}
                      className="w-5 h-5 accent-emerald-500"
                    />
                    <span className="text-zinc-200">Permitir múltiplos carrinhos por usuário</span>
                  </label>
                  <div className="space-y-2">
                    <Label className="text-sm">Máximo de carrinhos por usuário</Label>
                    <Input
                      type="number"
                      value={config.maxCartsPerUser || 3}
                      onChange={(e) => updateField("maxCartsPerUser", parseInt(e.target.value) || 3)}
                      className="bg-zinc-800 border-zinc-700"
                      disabled={!config.allowMultipleCarts}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
