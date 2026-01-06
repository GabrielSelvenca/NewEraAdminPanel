"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "@/components/ui/number-input";
import { motion } from "framer-motion";
import { 
  Save, 
  Loader2, 
  Timer, 
  DollarSign, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Gauge,
  Shield,
  Zap,
  RefreshCw
} from "lucide-react";

interface SettingCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  children: React.ReactNode;
  hint?: string;
}

const SettingCard = ({ icon: Icon, iconColor, title, description, children, hint }: SettingCardProps) => (
  <div className="glass-card p-5 hover-card border-l-2 border-l-transparent hover:border-l-cyan-500/50 transition-all">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-3">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-zinc-400 mt-0.5">{description}</p>
        </div>
        {children}
        {hint && (
          <p className="text-xs text-zinc-500 flex items-center gap-1">
            <span className="w-1 h-1 rounded-full bg-cyan-500" />
            {hint}
          </p>
        )}
      </div>
    </div>
  </div>
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function BotSettingsPage() {
  const [config, setConfig] = useState<BotConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await api.getConfig();
      setConfig(data);
    } catch (err) {
      console.error('Error loading config:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    setMessage(null);

    try {
      await api.updateConfig(config);
      await api.notifyBotUpdate();
      setMessage({ 
        type: 'success', 
        text: 'Configurações salvas! O bot será atualizado em até 10 segundos.' 
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: err instanceof Error ? err.message : 'Erro ao salvar' 
      });
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
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
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
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Timer className="w-6 h-6 text-amber-400" />
            Tempos & Limites
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">
            Configure timeouts, valores e comportamentos do bot
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={loadConfig}
            variant="outline" 
            size="sm"
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Recarregar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            size="sm"
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-white border-0"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Salvar
          </Button>
        </div>
      </motion.div>

      {/* Message */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Timeouts Section */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          Timeouts
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SettingCard
            icon={Clock}
            iconColor="bg-blue-500/20 text-blue-400"
            title="Timeout de Pagamento"
            description="Tempo máximo de espera pelo pagamento PIX"
            hint="Recomendado: 30 minutos"
          >
            <NumberInput
              value={config.paymentTimeoutMinutes || 30}
              onChange={(val) => updateField("paymentTimeoutMinutes", val)}
              min={5}
              max={120}
              step={5}
              suffix="min"
            />
          </SettingCard>

          <SettingCard
            icon={Timer}
            iconColor="bg-amber-500/20 text-amber-400"
            title="Inatividade do Carrinho"
            description="Tempo para fechar canal por inatividade"
            hint="Recomendado: 10 minutos"
          >
            <NumberInput
              value={config.cartInactivityMinutes || 10}
              onChange={(val) => updateField("cartInactivityMinutes", val)}
              min={5}
              max={60}
              step={5}
              suffix="min"
            />
          </SettingCard>

          <SettingCard
            icon={Zap}
            iconColor="bg-emerald-500/20 text-emerald-400"
            title="Fechamento Pós-Entrega"
            description="Tempo para fechar canal após entrega"
            hint="Recomendado: 5 minutos"
          >
            <NumberInput
              value={config.deliveryCloseMinutes || 5}
              onChange={(val) => updateField("deliveryCloseMinutes", val)}
              min={1}
              max={30}
              step={1}
              suffix="min"
            />
          </SettingCard>

          <SettingCard
            icon={RefreshCw}
            iconColor="bg-purple-500/20 text-purple-400"
            title="Intervalo de Verificação"
            description="Intervalo entre checks de pagamento"
            hint="Recomendado: 5 segundos"
          >
            <NumberInput
              value={config.paymentCheckInterval || 5}
              onChange={(val) => updateField("paymentCheckInterval", val)}
              min={3}
              max={30}
              step={1}
              suffix="seg"
            />
          </SettingCard>
        </div>
      </motion.div>

      {/* Values Section */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          Valores e Limites
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SettingCard
            icon={DollarSign}
            iconColor="bg-emerald-500/20 text-emerald-400"
            title="Preço por 1000 Robux"
            description="Valor em reais por cada 1000 Robux"
          >
            <NumberInput
              value={config.pricePerK || 27.99}
              onChange={(val) => updateField("pricePerK", val)}
              min={1}
              max={100}
              step={0.5}
              decimals={2}
              prefix="R$"
            />
          </SettingCard>

          <SettingCard
            icon={Gauge}
            iconColor="bg-cyan-500/20 text-cyan-400"
            title="Pedido Mínimo"
            description="Quantidade mínima de Robux por pedido"
          >
            <NumberInput
              value={config.minOrderAmount || 1000}
              onChange={(val) => updateField("minOrderAmount", val)}
              min={100}
              max={10000}
              step={100}
              suffix="R$"
            />
          </SettingCard>

          <SettingCard
            icon={Shield}
            iconColor="bg-red-500/20 text-red-400"
            title="Pedido Máximo"
            description="Limite de segurança por pedido"
          >
            <NumberInput
              value={config.maxOrderAmount || 100000}
              onChange={(val) => updateField("maxOrderAmount", val)}
              min={1000}
              max={1000000}
              step={1000}
              suffix="R$"
            />
          </SettingCard>

          <SettingCard
            icon={DollarSign}
            iconColor="bg-amber-500/20 text-amber-400"
            title="Taxa do Roblox"
            description="Taxa cobrada pelo Roblox nas transações"
            hint="Padrão do Roblox: 30%"
          >
            <NumberInput
              value={config.robloxTaxPercent || 30}
              onChange={(val) => updateField("robloxTaxPercent", val)}
              min={0}
              max={50}
              step={1}
              suffix="%"
            />
          </SettingCard>
        </div>
      </motion.div>

      {/* Toggles Section */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Funcionalidades
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          <div className="glass-card p-5 flex items-center justify-between hover-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Entrega Automática</h3>
                <p className="text-sm text-zinc-400">
                  Entregar automaticamente após pagamento
                </p>
              </div>
            </div>
            <Switch
              checked={config.autoDeliveryEnabled !== false}
              onCheckedChange={(checked) => updateField("autoDeliveryEnabled", checked)}
            />
          </div>

          <div className="glass-card p-5 flex items-center justify-between hover-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Verificação de Entrega</h3>
                <p className="text-sm text-zinc-400">
                  Verificar posse antes de confirmar
                </p>
              </div>
            </div>
            <Switch
              checked={config.verifyDeliveryEnabled !== false}
              onCheckedChange={(checked) => updateField("verifyDeliveryEnabled", checked)}
            />
          </div>

          <div className="glass-card p-5 flex items-center justify-between hover-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Sistema de Cupons</h3>
                <p className="text-sm text-zinc-400">
                  Permitir cupons de desconto
                </p>
              </div>
            </div>
            <Switch
              checked={config.couponsEnabled !== false}
              onCheckedChange={(checked) => updateField("couponsEnabled", checked)}
            />
          </div>

          <div className="glass-card p-5 flex items-center justify-between hover-card">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Logs Detalhados</h3>
                <p className="text-sm text-zinc-400">
                  Modo debug (afeta performance)
                </p>
              </div>
            </div>
            <Switch
              checked={config.debugLogsEnabled === true}
              onCheckedChange={(checked) => updateField("debugLogsEnabled", checked)}
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
