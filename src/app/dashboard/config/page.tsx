"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2, RefreshCw, Server, Hash, Users, FolderOpen, CheckCircle2, Store, MessageSquare, Bot, Bell } from "lucide-react";

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
      setMessage("Configurações salvas com sucesso!");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar");
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
    return (
      <div className="text-center text-zinc-500 py-12">
        Erro ao carregar configurações
      </div>
    );
  }

  const syncedAt = serverData?.syncedAt ? new Date(serverData.syncedAt).toLocaleString('pt-BR') : null;

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

      {/* Status do Servidor */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {serverData?.guildIcon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={serverData.guildIcon} alt="" className="w-12 h-12 rounded-full" />
              )}
              <div>
                <CardTitle className="text-zinc-100 flex items-center gap-2">
                  <Server className="w-5 h-5 text-emerald-500" />
                  {serverData?.guildName || "Servidor não sincronizado"}
                </CardTitle>
                {serverData && (
                  <CardDescription className="flex items-center gap-4 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" /> {serverData.memberCount} membros
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderOpen className="w-4 h-4" /> {serverData.categories.length} categorias
                    </span>
                    <span className="flex items-center gap-1">
                      <Hash className="w-4 h-4" /> {serverData.roles.length} cargos
                    </span>
                  </CardDescription>
                )}
              </div>
            </div>
            {syncedAt && (
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sincronizado: {syncedAt}
              </div>
            )}
          </div>
        </CardHeader>
        {!serverData && (
          <CardContent>
            <div className="text-center py-4 text-zinc-500">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>O bot precisa estar online para sincronizar os dados do servidor.</p>
              <p className="text-sm mt-1">Reinicie o bot para sincronizar categorias e cargos.</p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Categorias Discord */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              Categorias Discord
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Categoria de Carrinhos</Label>
              {serverData ? (
                <Select
                  value={config.categoryCarts || ""}
                  onValueChange={(value) => updateField("categoryCarts", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {serverData.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-zinc-100">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={config.categoryCarts || ""}
                  onChange={(e) => updateField("categoryCarts", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="ID da categoria"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Categoria de Aprovados</Label>
              {serverData ? (
                <Select
                  value={config.categoryApproved || ""}
                  onValueChange={(value) => updateField("categoryApproved", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {serverData.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-zinc-100">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={config.categoryApproved || ""}
                  onChange={(e) => updateField("categoryApproved", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="ID da categoria"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Canal de Logs de Compras</Label>
              {serverData ? (
                <Select
                  value={config.channelLogsPurchases || ""}
                  onValueChange={(value) => updateField("channelLogsPurchases", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione um canal" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {serverData.textChannels.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id} className="text-zinc-100">
                        # {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={config.channelLogsPurchases || ""}
                  onChange={(e) => updateField("channelLogsPurchases", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="ID do canal"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Canal de Logs de Entregas</Label>
              {serverData ? (
                <Select
                  value={config.channelLogsDeliveries || ""}
                  onValueChange={(value) => updateField("channelLogsDeliveries", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione um canal" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {serverData.textChannels.map((ch) => (
                      <SelectItem key={ch.id} value={ch.id} className="text-zinc-100">
                        # {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={config.channelLogsDeliveries || ""}
                  onChange={(e) => updateField("channelLogsDeliveries", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="ID do canal"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Categoria de Tickets</Label>
              {serverData ? (
                <Select
                  value={config.categoryTickets || ""}
                  onValueChange={(value) => updateField("categoryTickets", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {serverData.categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id} className="text-zinc-100">
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={config.categoryTickets || ""}
                  onChange={(e) => updateField("categoryTickets", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="ID da categoria"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cargos Discord */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Cargos Discord
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Cargo de Admin</Label>
              {serverData ? (
                <Select
                  value={config.roleAdmin || ""}
                  onValueChange={(value) => updateField("roleAdmin", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {serverData.roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-zinc-100">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                          {role.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={config.roleAdmin || ""}
                  onChange={(e) => updateField("roleAdmin", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="ID do cargo"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-zinc-300">Cargo de Cliente (dado após compra)</Label>
              {serverData ? (
                <Select
                  value={config.roleClient || ""}
                  onValueChange={(value) => updateField("roleClient", value)}
                >
                  <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100">
                    <SelectValue placeholder="Selecione um cargo" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    {serverData.roles.map((role) => (
                      <SelectItem key={role.id} value={role.id} className="text-zinc-100">
                        <span className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                          {role.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={config.roleClient || ""}
                  onChange={(e) => updateField("roleClient", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="ID do cargo"
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configurações da Loja */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-500" />
              Loja
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                <Label className="text-zinc-300">Cor da Loja</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.storeColor || "#257e24"}
                    onChange={(e) => updateField("storeColor", e.target.value)}
                    className="w-12 h-10 p-1 bg-zinc-800 border-zinc-700 cursor-pointer"
                  />
                  <Input
                    value={config.storeColor || "#257e24"}
                    onChange={(e) => updateField("storeColor", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100 flex-1"
                    placeholder="#257e24"
                  />
                </div>
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
            </div>
          </CardContent>
        </Card>

        {/* Configurações do Bot */}
        <Card className="bg-zinc-900 border-zinc-800 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Bot className="w-5 h-5 text-blue-500" />
              Configurações do Bot
            </CardTitle>
            <CardDescription className="text-zinc-500">
              Personalize mensagens e comportamento do bot
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Toggles */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-750">
                <input
                  type="checkbox"
                  checked={config.notifyOnPurchase ?? true}
                  onChange={(e) => updateField("notifyOnPurchase", e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <div>
                  <p className="text-zinc-200 text-sm font-medium">Notificar Compras</p>
                  <p className="text-zinc-500 text-xs">Logs de compra</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-750">
                <input
                  type="checkbox"
                  checked={config.notifyOnDelivery ?? true}
                  onChange={(e) => updateField("notifyOnDelivery", e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <div>
                  <p className="text-zinc-200 text-sm font-medium">Notificar Entregas</p>
                  <p className="text-zinc-500 text-xs">Logs de entrega</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-750">
                <input
                  type="checkbox"
                  checked={config.autoDeleteCarts ?? true}
                  onChange={(e) => updateField("autoDeleteCarts", e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <div>
                  <p className="text-zinc-200 text-sm font-medium">Auto-deletar Carrinhos</p>
                  <p className="text-zinc-500 text-xs">Após inatividade</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 bg-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-750">
                <input
                  type="checkbox"
                  checked={config.showPriceInEmbed ?? true}
                  onChange={(e) => updateField("showPriceInEmbed", e.target.checked)}
                  className="w-4 h-4 accent-emerald-500"
                />
                <div>
                  <p className="text-zinc-200 text-sm font-medium">Mostrar Preços</p>
                  <p className="text-zinc-500 text-xs">Nos embeds</p>
                </div>
              </label>
            </div>

            {/* Mensagens */}
            <div>
              <h4 className="text-zinc-300 font-medium mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                Mensagens Personalizadas
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Boas-vindas</Label>
                  <Input
                    value={config.welcomeMessage || ""}
                    onChange={(e) => updateField("welcomeMessage", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Bem-vindo à {storeName}! 🎮"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Carrinho Criado</Label>
                  <Input
                    value={config.cartCreatedMessage || ""}
                    onChange={(e) => updateField("cartCreatedMessage", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Seu carrinho foi criado! 🛒"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Aguardando Pagamento</Label>
                  <Input
                    value={config.paymentPendingMessage || ""}
                    onChange={(e) => updateField("paymentPendingMessage", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Aguardando pagamento... ⏳"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Compra Concluída</Label>
                  <Input
                    value={config.purchaseCompleteMessage || ""}
                    onChange={(e) => updateField("purchaseCompleteMessage", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Compra realizada com sucesso! ✅"
                  />
                </div>
              </div>
            </div>

            {/* Embed Settings */}
            <div>
              <h4 className="text-zinc-300 font-medium mb-3 flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Personalização dos Embeds
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">Texto do Footer</Label>
                  <Input
                    value={config.embedFooterText || ""}
                    onChange={(e) => updateField("embedFooterText", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Nova Era Store • Robux com segurança"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-sm">URL da Thumbnail</Label>
                  <Input
                    value={config.embedThumbnailUrl || ""}
                    onChange={(e) => updateField("embedThumbnailUrl", e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="https://exemplo.com/logo.png"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
