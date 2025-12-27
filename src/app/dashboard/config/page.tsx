"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save, Loader2, FolderOpen, Hash, Palette, Image as ImageIcon, MessageSquare, RefreshCw, DollarSign, Upload } from "lucide-react";
import { DiscordEmbedPreview } from "@/components/discord-embed-preview";
import { ImageCropEditor } from "@/components/image-crop-editor";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface DiscordServerData {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  categories: { id: string; name: string }[];
  textChannels: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}

export default function ConfigPage() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [serverData, setServerData] = useState<DiscordServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [cropField, setCropField] = useState<"bannerRobux" | "bannerGamepass">("bannerRobux");

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
      console.log('💾 Salvando configurações:', config);
      console.log('💰 PricePerK sendo enviado:', config.pricePerK, typeof config.pricePerK);
      await api.updateConfig(config);
      await api.notifyBotUpdate();
      setMessage("✅ Configurações salvas! Bot será atualizado automaticamente em até 10 segundos.");
      await loadData();
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
      setMessage("✅ Bot notificado! Atualizando em até 10 segundos.");
      setTimeout(() => loadData(), 2000);
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

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: "bannerRobux" | "bannerGamepass") => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageToCrop(reader.result as string);
      setCropField(field);
      setCropperOpen(true);
    };
    reader.readAsDataURL(file);
    
    event.target.value = "";
  };

  const handleSaveCroppedImage = async (croppedBlob: Blob) => {
    setUploading(true);
    setMessage("");
    
    try {
      const file = new File([croppedBlob], "banner.jpg", { type: "image/jpeg" });
      const result = await api.uploadImage(file);
      updateField(cropField, result.url);
      setMessage(`✅ Banner enviado com sucesso!`);
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "Erro ao enviar imagem"}`);
    } finally {
      setUploading(false);
    }
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
      <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-zinc-100">Configurações - Robux</h1>
            <p className="text-zinc-400 mt-1">Configure o sistema de vendas de Robux</p>
          </div>
          <div className="flex gap-3">
            {!serverData && (
              <Button 
                onClick={handleSync} 
                disabled={saving} 
                variant="outline" 
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:border-blue-500"
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Sincronizar Discord
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {saving ? "Salvando..." : "Salvar Configurações"}
            </Button>
          </div>
        </div>
        {!serverData && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-sm text-blue-400">
              <span className="font-semibold">💡 Dica:</span> Clique em &quot;Sincronizar Discord&quot; para que o bot envie as categorias e canais do servidor, permitindo seleção via dropdown.
            </p>
          </div>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-lg flex items-start gap-3 ${message.includes("✅") ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          <span className="text-xl">{message.includes("✅") ? "✅" : "❌"}</span>
          <span className="flex-1">{message.replace(/[✅❌]/g, '').trim()}</span>
        </div>
      )}

      <Accordion type="multiple" defaultValue={["store", "discord", "visual"]} className="space-y-4">
        
        {/* Configurações da Loja */}
        <AccordionItem value="store" className="bg-zinc-900 border-zinc-800 rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
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
                    min="20"
                    value={config.pricePerK ? config.pricePerK.toFixed(2) : "20.00"}
                    onChange={(e) => updateField("pricePerK", Math.max(20, parseFloat(e.target.value) || 20))}
                    className="bg-zinc-800 border-zinc-700"
                  />
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Discord - Categorias e Canais */}
        <AccordionItem value="discord" className="bg-zinc-900 border-zinc-800 rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-blue-500" />
              Discord - Categorias e Canais
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              {/* Categorias */}
              <div>
                <h3 className="font-semibold text-zinc-200 mb-3">Categorias</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Carrinhos Robux</Label>
                    {serverData ? (
                      <Select
                        value={config.categoryCartsRobux || ""}
                        onValueChange={(value) => updateField("categoryCartsRobux", value)}
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
                        value={config.categoryCartsRobux || ""}
                        onChange={(e) => updateField("categoryCartsRobux", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="ID da categoria"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Aprovados (Pendentes de Entrega)</Label>
                    {serverData ? (
                      <Select
                        value={config.categoryApproved || ""}
                        onValueChange={(value) => updateField("categoryApproved", value)}
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
                        value={config.categoryApproved || ""}
                        onChange={(e) => updateField("categoryApproved", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="ID da categoria"
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Canais */}
              <div className="pt-4 border-t border-zinc-800">
                <h3 className="font-semibold text-zinc-200 mb-3 flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  Canais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Compras Concluídas (Log)</Label>
                    {serverData ? (
                      <Select
                        value={config.channelPurchasesLog || ""}
                        onValueChange={(value) => updateField("channelPurchasesLog", value)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Selecione canal" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {serverData.textChannels.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              {ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={config.channelPurchasesLog || ""}
                        onChange={(e) => updateField("channelPurchasesLog", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="ID do canal"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Entregas Concluídas</Label>
                    {serverData ? (
                      <Select
                        value={config.channelDeliveriesLog || ""}
                        onValueChange={(value) => updateField("channelDeliveriesLog", value)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Selecione canal" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {serverData.textChannels.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              {ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={config.channelDeliveriesLog || ""}
                        onChange={(e) => updateField("channelDeliveriesLog", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="ID do canal"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Setup Embed Robux</Label>
                    {serverData ? (
                      <Select
                        value={config.channelSetupRobux || ""}
                        onValueChange={(value) => updateField("channelSetupRobux", value)}
                      >
                        <SelectTrigger className="bg-zinc-800 border-zinc-700">
                          <SelectValue placeholder="Selecione canal" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-800 border-zinc-700">
                          {serverData.textChannels.map((ch) => (
                            <SelectItem key={ch.id} value={ch.id}>
                              {ch.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={config.channelSetupRobux || ""}
                        onChange={(e) => updateField("channelSetupRobux", e.target.value)}
                        className="bg-zinc-800 border-zinc-700"
                        placeholder="ID do canal"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Visual - Mensagens e Embeds */}
        <AccordionItem value="visual" className="bg-zinc-900 border-zinc-800 rounded-lg px-6">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline">
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-pink-500" />
              Visual - Mensagens e Embeds
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Cor da Loja (Hex)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={config.storeColor || "#257e24"}
                      onChange={(e) => updateField("storeColor", e.target.value)}
                      className="w-16 h-10 p-1 bg-zinc-800 border-zinc-700 cursor-pointer"
                    />
                    <Input
                      value={config.storeColor || ""}
                      onChange={(e) => updateField("storeColor", e.target.value)}
                      className="flex-1 bg-zinc-800 border-zinc-700"
                      placeholder="#257e24"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    Banner Robux
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={config.bannerRobux || ""}
                      onChange={(e) => updateField("bannerRobux", e.target.value)}
                      className="bg-zinc-800 border-zinc-700 flex-1"
                      placeholder="URL da imagem ou faça upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={uploading}
                      onClick={() => document.getElementById('banner-robux-upload')?.click()}
                      className="border-zinc-700"
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
                    <input
                      id="banner-robux-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageUpload(e, "bannerRobux")}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Mensagem do Embed Robux
                </Label>
                <Textarea
                  value={config.embedRobuxMessage || ""}
                  onChange={(e) => updateField("embedRobuxMessage", e.target.value)}
                  className="bg-zinc-800 border-zinc-700 min-h-[120px] font-mono text-sm"
                  placeholder="Mensagem que aparece no embed de compra de Robux..."
                />
              </div>

              {config.embedRobuxMessage && (
                <div className="pt-4 border-t border-zinc-800">
                  <Label className="mb-3 block">Preview do Embed</Label>
                  <DiscordEmbedPreview
                    title={config.storeName || "Nova Era Store"}
                    description={config.embedRobuxMessage}
                    color={config.storeColor || "#257e24"}
                    imageUrl={config.bannerRobux}
                  />
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <ImageCropEditor
        image={imageToCrop}
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onSave={handleSaveCroppedImage}
        aspect={16 / 9}
      />
    </div>
  );
}
