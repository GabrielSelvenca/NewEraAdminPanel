"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NumberInput } from "@/components/ui/number-input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Save, Loader2, FolderOpen, Hash, Palette, Image as ImageIcon, 
  MessageSquare, RefreshCw, Upload, Gamepad2, DollarSign,
  ChevronDown, ChevronUp, Eye, CheckCircle, AlertCircle, Info
} from "lucide-react";
import { DiscordEmbedPreview } from "@/components/discord-embed-preview";
import { ImageCropEditor } from "@/components/image-crop-editor";

interface DiscordServerData {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  categories: { id: string; name: string }[];
  textChannels: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}

type TabType = 'robux' | 'games';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ConfigPage() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [serverData, setServerData] = useState<DiscordServerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string>("");
  const [cropField, setCropField] = useState<"bannerRobux" | "bannerGamepass" | "purchaseApprovedBanner" | "purchaseLogBanner">("bannerRobux");
  
  // Active tab
  const [activeTab, setActiveTab] = useState<TabType>('robux');
  
  // Collapsible sections
  const [showDiscord, setShowDiscord] = useState(false);
  const [showVisual, setShowVisual] = useState(true);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configData, discordData] = await Promise.all([
        api.getConfig(),
        api.getDiscordServerData().catch(() => null),
      ]);
      setConfig(configData);
      setServerData(discordData);
    } catch {
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);
    try {
      const configToSave = {
        ...config,
        guildId: serverData?.guildId || config.guildId,
      };
      await api.updateConfig(configToSave);
      await api.notifyBotUpdate();
      setMessage({ type: 'success', text: 'Salvo! Bot atualizando em até 10s.' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao salvar' });
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSaving(true);
    try {
      await api.notifyBotUpdate();
      setMessage({ type: 'success', text: 'Bot notificado!' });
      setTimeout(() => loadData(), 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao sincronizar' });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof BotConfig, value: string | number | boolean) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const processPlaceholders = (text: string): string => {
    if (!config) return text;
    return text
      .replace(/\{store_name\}/g, config.storeName || "Nova Era Store")
      .replace(/\{price_per_k\}/g, `R$ ${(config.pricePerKRobux || 41.50).toFixed(2)}`)
      .replace(/\{min_order\}/g, String(config.minOrderAmount || 1000))
      .replace(/\{max_order\}/g, String(config.maxOrderAmount || 100000));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, field: "bannerRobux" | "bannerGamepass" | "purchaseApprovedBanner" | "purchaseLogBanner") => {
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
    try {
      const file = new File([croppedBlob], "banner.jpg", { type: "image/jpeg" });
      const result = await api.uploadImage(file);
      updateField(cropField, result.url);
      setMessage({ type: 'success', text: 'Banner enviado!' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao enviar' });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (!config) {
    return <div className="text-center text-zinc-500 py-12">Erro ao carregar</div>;
  }

  const Section = ({ 
    title, 
    icon: Icon, 
    iconColor, 
    open, 
    onToggle, 
    children 
  }: { 
    title: string; 
    icon: React.ElementType; 
    iconColor: string; 
    open: boolean; 
    onToggle: () => void; 
    children: React.ReactNode;
  }) => (
    <div className="glass-card overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${iconColor}`}>
            <Icon className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-white">{title}</h3>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-zinc-500" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 pb-4 space-y-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  // Tab Content Components
  const RobuxTabContent = () => (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Store Config */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Configurações da Loja
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Nome da Loja</Label>
            <Input
              value={config.storeName || ""}
              onChange={(e) => updateField("storeName", e.target.value)}
              className="bg-zinc-800/50 border-zinc-700"
              placeholder="Nova Era Store"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Preço Robux (1000)</Label>
            <NumberInput
              value={config.pricePerKRobux || 41.50}
              onChange={(val) => updateField("pricePerKRobux", val)}
              min={1}
              max={200}
              step={0.5}
              decimals={2}
              prefix="R$"
              size="sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Cor Principal</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.storeColor || "#257e24"}
                onChange={(e) => updateField("storeColor", e.target.value)}
                className="w-12 h-10 p-1 bg-zinc-800/50 border-zinc-700 cursor-pointer"
              />
              <Input
                value={config.storeColor || "#257e24"}
                onChange={(e) => updateField("storeColor", e.target.value)}
                className="flex-1 bg-zinc-800/50 border-zinc-700 font-mono"
                placeholder="#257e24"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Visual Section */}
      <Section
        title="Mensagens & Embeds"
        icon={MessageSquare}
        iconColor="bg-pink-500/10 text-pink-400"
        open={showVisual}
        onToggle={() => setShowVisual(!showVisual)}
      >
        {/* Banner */}
        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <ImageIcon className="w-3 h-3" />
            Banner Robux
          </Label>
          <div className="flex gap-2">
            <Input
              value={config.bannerRobux || ""}
              onChange={(e) => updateField("bannerRobux", e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 flex-1"
              placeholder="URL da imagem ou faça upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('banner-robux-upload')?.click()}
              className="border-zinc-700 hover:bg-zinc-700"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
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

        {/* Embed Message */}
        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs uppercase">Mensagem do Embed</Label>
          <Textarea
            value={config.embedRobuxMessage || ""}
            onChange={(e) => updateField("embedRobuxMessage", e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 min-h-[100px] font-mono text-sm"
            placeholder="Compre Robux com segurança..."
          />
          <div className="text-xs text-zinc-600 bg-zinc-800/30 rounded p-2">
            <span className="text-zinc-500">Placeholders:</span>{" "}
            <code className="text-pink-400">{"{store_name}"}</code>{" "}
            <code className="text-pink-400">{"{price_per_k}"}</code>{" "}
            <code className="text-pink-400">{"{min_order}"}</code>{" "}
            <code className="text-pink-400">{"{max_order}"}</code>
          </div>
        </div>

        {/* Approved Message */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <Label className="text-zinc-400 text-xs uppercase">Mensagem de Aprovação</Label>
          <Textarea
            value={config.purchaseApprovedMessage || ""}
            onChange={(e) => updateField("purchaseApprovedMessage", e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 min-h-[80px] font-mono text-sm"
            placeholder="Sua compra foi aprovada..."
          />
          <div className="flex gap-2">
            <Input
              value={config.purchaseApprovedBanner || ""}
              onChange={(e) => updateField("purchaseApprovedBanner", e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 flex-1"
              placeholder="Banner de aprovação (URL)"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('banner-approved-upload')?.click()}
              className="border-zinc-700"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <input
              id="banner-approved-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "purchaseApprovedBanner")}
            />
          </div>
        </div>

        {/* Log Message */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <Label className="text-zinc-400 text-xs uppercase">Mensagem de Log</Label>
          <Textarea
            value={config.purchaseLogMessage || ""}
            onChange={(e) => updateField("purchaseLogMessage", e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 min-h-[80px] font-mono text-sm"
            placeholder="Nova compra realizada..."
          />
          <div className="flex gap-2">
            <Input
              value={config.purchaseLogBanner || ""}
              onChange={(e) => updateField("purchaseLogBanner", e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 flex-1"
              placeholder="Banner de log (URL)"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => document.getElementById('banner-log-upload')?.click()}
              className="border-zinc-700"
            >
              <Upload className="w-4 h-4" />
            </Button>
            <input
              id="banner-log-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "purchaseLogBanner")}
            />
          </div>
        </div>
      </Section>

      {/* Preview Section */}
      <Section
        title="Preview do Embed"
        icon={Eye}
        iconColor="bg-cyan-500/10 text-cyan-400"
        open={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
      >
        <DiscordEmbedPreview
          title={`💎 ${config.storeName || "Nova Era Store"}`}
          description={processPlaceholders(config.embedRobuxMessage || `Compre Robux com segurança!\n\nPreço: **{price_per_k}** por 1000 Robux`)}
          color={config.storeColor || "#257e24"}
          imageUrl={config.bannerRobux}
          pricePerKRobux={config.pricePerKRobux || 41.50}
        />
      </Section>

      {/* Discord Section */}
      <Section
        title="Categorias & Canais"
        icon={FolderOpen}
        iconColor="bg-blue-500/10 text-blue-400"
        open={showDiscord}
        onToggle={() => setShowDiscord(!showDiscord)}
      >
        {!serverData && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-400 mb-4">
            💡 Clique em &quot;Sync&quot; para carregar categorias e canais do Discord
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Categoria Carrinhos</Label>
            {serverData ? (
              <Select value={config.categoryCarts || ""} onValueChange={(value) => updateField("categoryCarts", value)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {serverData.categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input value={config.categoryCarts || ""} onChange={(e) => updateField("categoryCarts", e.target.value)} className="bg-zinc-800/50 border-zinc-700" placeholder="ID" />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Categoria Aprovados</Label>
            {serverData ? (
              <Select value={config.categoryApproved || ""} onValueChange={(value) => updateField("categoryApproved", value)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {serverData.categories.map((cat) => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input value={config.categoryApproved || ""} onChange={(e) => updateField("categoryApproved", e.target.value)} className="bg-zinc-800/50 border-zinc-700" placeholder="ID" />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase flex items-center gap-1"><Hash className="w-3 h-3" /> Canal Logs Compras</Label>
            {serverData ? (
              <Select value={config.channelLogsPurchases || ""} onValueChange={(value) => updateField("channelLogsPurchases", value)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {serverData.textChannels.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input value={config.channelLogsPurchases || ""} onChange={(e) => updateField("channelLogsPurchases", e.target.value)} className="bg-zinc-800/50 border-zinc-700" placeholder="ID" />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase flex items-center gap-1"><Hash className="w-3 h-3" /> Canal Logs Entregas</Label>
            {serverData ? (
              <Select value={config.channelLogsDeliveries || ""} onValueChange={(value) => updateField("channelLogsDeliveries", value)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {serverData.textChannels.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input value={config.channelLogsDeliveries || ""} onChange={(e) => updateField("channelLogsDeliveries", e.target.value)} className="bg-zinc-800/50 border-zinc-700" placeholder="ID" />
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase flex items-center gap-1"><Hash className="w-3 h-3" /> Canal Setup Robux</Label>
            {serverData ? (
              <Select value={config.channelSetupRobux || ""} onValueChange={(value) => updateField("channelSetupRobux", value)}>
                <SelectTrigger className="bg-zinc-800/50 border-zinc-700"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  {serverData.textChannels.map((ch) => <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input value={config.channelSetupRobux || ""} onChange={(e) => updateField("channelSetupRobux", e.target.value)} className="bg-zinc-800/50 border-zinc-700" placeholder="ID" />
            )}
          </div>
        </div>
      </Section>
    </motion.div>
  );

  const GamesTabContent = () => (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {/* Link para gestão de jogos */}
      <div className="glass-card p-4 border-l-2 border-l-emerald-500">
        <div className="flex items-center justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <Gamepad2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-emerald-400 font-medium text-sm">Gerenciar Jogos e Itens</p>
              <p className="text-zinc-400 text-sm mt-1">
                Para adicionar, editar ou remover jogos e itens, acesse a página de Jogos no menu lateral.
              </p>
            </div>
          </div>
          <Button 
            onClick={() => window.location.href = '/dashboard/games'}
            variant="outline"
            size="sm"
            className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
          >
            <Gamepad2 className="w-4 h-4 mr-2" />
            Ir para Jogos
          </Button>
        </div>
      </div>

      {/* Store Config para Jogos */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-emerald-400" />
          Configurações de Preço
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Preço por 1000 Robux (Jogos)</Label>
            <p className="text-xs text-zinc-500 mb-2">Usado para calcular o preço dos itens baseado no custo em Robux</p>
            <NumberInput
              value={config.pricePerKGamepass || 35.00}
              onChange={(val) => updateField("pricePerKGamepass", val)}
              min={1}
              max={200}
              step={0.5}
              decimals={2}
              prefix="R$"
              size="sm"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Cor do Embed de Jogos</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={config.storeColor || "#10b981"}
                onChange={(e) => updateField("storeColor", e.target.value)}
                className="w-12 h-10 p-1 bg-zinc-800/50 border-zinc-700 cursor-pointer"
              />
              <Input
                value={config.storeColor || "#10b981"}
                onChange={(e) => updateField("storeColor", e.target.value)}
                className="flex-1 bg-zinc-800/50 border-zinc-700 font-mono"
                placeholder="#10b981"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Canal de Setup */}
      <div className="glass-card p-5">
        <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
          <Hash className="w-4 h-4 text-blue-400" />
          Canal de Setup
        </h3>
        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs uppercase">Canal de Setup de Jogos</Label>
          <p className="text-sm text-zinc-500 mb-2">
            Canal onde será enviada a mensagem de seleção de jogos para compra de itens
          </p>
          {serverData ? (
            <Select
              value={config.channelSetupGamepass || ""}
              onValueChange={(value) => updateField("channelSetupGamepass", value)}
            >
              <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                <SelectValue placeholder="Selecione o canal" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                {serverData.textChannels.map((channel) => (
                  <SelectItem key={channel.id} value={channel.id}>
                    # {channel.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <div className="flex gap-2">
              <Input 
                value={config.channelSetupGamepass || ""} 
                onChange={(e) => updateField("channelSetupGamepass", e.target.value)} 
                className="bg-zinc-800/50 border-zinc-700" 
                placeholder="ID do canal" 
              />
              <Button 
                onClick={handleSync} 
                variant="outline" 
                className="border-blue-500/50 text-blue-400"
              >
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Visual Section - Mensagens & Embeds */}
      <Section
        title="Mensagens & Embeds"
        icon={MessageSquare}
        iconColor="bg-pink-500/10 text-pink-400"
        open={showVisual}
        onToggle={() => setShowVisual(!showVisual)}
      >
        {/* Banner */}
        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs uppercase flex items-center gap-2">
            <ImageIcon className="w-3 h-3" />
            Banner de Jogos
          </Label>
          <div className="flex gap-2">
            <Input
              value={config.bannerGamepass || ""}
              onChange={(e) => updateField("bannerGamepass", e.target.value)}
              className="bg-zinc-800/50 border-zinc-700 flex-1"
              placeholder="URL da imagem ou faça upload"
            />
            <Button
              type="button"
              variant="outline"
              disabled={uploading}
              onClick={() => document.getElementById('banner-gamepass-upload')?.click()}
              className="border-zinc-700 hover:bg-zinc-700"
            >
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            </Button>
            <input
              id="banner-gamepass-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageUpload(e, "bannerGamepass")}
            />
          </div>
        </div>

        {/* Embed Message */}
        <div className="space-y-2">
          <Label className="text-zinc-400 text-xs uppercase">Mensagem do Embed de Jogos</Label>
          <Textarea
            value={config.embedGamepassMessage || ""}
            onChange={(e) => updateField("embedGamepassMessage", e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 min-h-[100px] font-mono text-sm"
            placeholder="Compre itens exclusivos para seus jogos favoritos..."
          />
          <div className="text-xs text-zinc-600 bg-zinc-800/30 rounded p-2">
            <span className="text-zinc-500">Placeholders:</span>{" "}
            <code className="text-pink-400">{"{store_name}"}</code>{" "}
            <code className="text-pink-400">{"{price_per_k}"}</code>{" "}
            <code className="text-pink-400">{"{lista-jogos}"}</code>
          </div>
        </div>

        {/* Approved Message (compartilhada com Robux ou pode criar específica) */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <Label className="text-zinc-400 text-xs uppercase">Mensagem de Aprovação (Jogos)</Label>
          <p className="text-xs text-zinc-500">Mensagem enviada quando o pagamento de itens de jogo é aprovado</p>
          <Textarea
            value={config.gameApprovedMessage || config.purchaseApprovedMessage || ""}
            onChange={(e) => updateField("gameApprovedMessage", e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 min-h-[80px] font-mono text-sm"
            placeholder="Sua compra foi aprovada! Aguarde o entregador no jogo..."
          />
        </div>

        {/* Delivery Message */}
        <div className="pt-4 border-t border-zinc-800 space-y-2">
          <Label className="text-zinc-400 text-xs uppercase">Mensagem de Entrega (Jogos)</Label>
          <p className="text-xs text-zinc-500">Mensagem enviada quando os itens são entregues no jogo</p>
          <Textarea
            value={config.gameDeliveredMessage || ""}
            onChange={(e) => updateField("gameDeliveredMessage", e.target.value)}
            className="bg-zinc-800/50 border-zinc-700 min-h-[80px] font-mono text-sm"
            placeholder="Seus itens foram entregues com sucesso! 🎉"
          />
        </div>
      </Section>

      {/* Preview Section */}
      <Section
        title="Preview do Embed"
        icon={Eye}
        iconColor="bg-cyan-500/10 text-cyan-400"
        open={showPreview}
        onToggle={() => setShowPreview(!showPreview)}
      >
        <DiscordEmbedPreview
          title={`🎮 ${config.storeName || "Nova Era Store"} - Jogos`}
          description={processPlaceholders(config.embedGamepassMessage || `Compre itens exclusivos para seus jogos!\n\nPreço: **{price_per_k}** por 1000 Robux`)}
          color={config.storeColor || "#10b981"}
          imageUrl={config.bannerGamepass}
          pricePerKRobux={config.pricePerKGamepass || 35.00}
        />
      </Section>
    </motion.div>
  );

  return (
    <motion.div 
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header with Tabs */}
      <motion.div variants={item} className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Palette className="w-6 h-6 text-pink-400" />
              Visual & Mensagens
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Personalize a aparência do bot</p>
          </div>
          <div className="flex gap-2">
            {!serverData && (
              <Button 
                onClick={handleSync} 
                disabled={saving} 
                variant="outline" 
                size="sm"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
                Sync
              </Button>
            )}
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              size="sm"
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </div>

        {/* Dynamic Tabs */}
        <div className="flex gap-1 p-1 bg-zinc-800/50 rounded-xl w-fit">
          <button
            onClick={() => setActiveTab('robux')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'robux'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Robux
          </button>
          <button
            onClick={() => setActiveTab('games')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'games'
                ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-lg'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700/50'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            Jogos (Gamepass)
          </button>
        </div>
      </motion.div>

      {/* Toast */}
      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
              message.type === 'success' 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'robux' ? (
          <RobuxTabContent key="robux" />
        ) : (
          <GamesTabContent key="games" />
        )}
      </AnimatePresence>

      <ImageCropEditor
        image={imageToCrop}
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        onSave={handleSaveCroppedImage}
        aspect={16 / 9}
      />
    </motion.div>
  );
}
