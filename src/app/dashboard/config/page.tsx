"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { 
  Save, Loader2, FolderOpen, Hash, Palette, Image as ImageIcon, 
  MessageSquare, RefreshCw, Upload, Gamepad2, DollarSign,
  ChevronDown, ChevronUp, Eye, CheckCircle, AlertCircle
} from "lucide-react";
import { DiscordEmbedPreview } from "@/components/discord-embed-preview";
import { ImageCropEditor } from "@/components/image-crop-editor";
import Link from "next/link";

interface DiscordServerData {
  guildId: string;
  guildName: string;
  guildIcon?: string;
  categories: { id: string; name: string }[];
  textChannels: { id: string; name: string }[];
  roles: { id: string; name: string }[];
}

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
      .replace(/\{price_per_k\}/g, `R$ ${(config.pricePerK || 27.99).toFixed(2)}`)
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
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
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
      {open && <div className="px-4 pb-4 space-y-4">{children}</div>}
    </div>
  );

  return (
    <motion.div 
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Palette className="w-6 h-6 text-pink-400" />
            Visual & Mensagens
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Personalize a aparência do bot</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/config/games">
            <Button variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800">
              <Gamepad2 className="w-4 h-4 mr-2" />
              Jogos
            </Button>
          </Link>
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
      </motion.div>

      {/* Toast */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
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

      {/* Store Config - Always visible */}
      <motion.div variants={item} className="glass-card p-5">
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
            <Label className="text-zinc-400 text-xs uppercase">Preço por 1000 R$</Label>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={config.pricePerK?.toFixed(2) || "27.99"}
              onChange={(e) => updateField("pricePerK", parseFloat(e.target.value) || 27.99)}
              className="bg-zinc-800/50 border-zinc-700"
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
      </motion.div>

      {/* Visual Section */}
      <motion.div variants={item}>
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
      </motion.div>

      {/* Preview Section */}
      <motion.div variants={item}>
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
          />
        </Section>
      </motion.div>

      {/* Discord Section */}
      <motion.div variants={item}>
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
