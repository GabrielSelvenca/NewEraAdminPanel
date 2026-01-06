"use client";

import { useEffect, useState } from "react";
import { api, BotConfig } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
}

const SettingCard = ({ icon: Icon, iconColor, title, description, children }: SettingCardProps) => (
  <div className="glass-card p-6 hover-card">
    <div className="flex items-start gap-4">
      <div className={`p-3 rounded-xl ${iconColor}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 space-y-4">
        <div>
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="text-sm text-zinc-400 mt-1">{description}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
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
      className="space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="page-header">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-sm font-medium mb-2">
              <Timer className="w-4 h-4" />
              <span>Configurações Avançadas</span>
            </div>
            <h1 className="text-4xl font-bold text-white">Tempos & Limites</h1>
            <p className="text-zinc-400 mt-2">
              Configure timeouts, valores mínimos/máximos e comportamentos do bot
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={loadConfig}
              variant="outline" 
              className="border-zinc-700 hover:bg-zinc-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Recarregar
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-white border-0"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
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

      {/* Settings Grid */}
      <motion.div variants={item} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeout de Pagamento */}
        <SettingCard
          icon={Clock}
          iconColor="bg-blue-500/20 text-blue-400"
          title="Timeout de Pagamento"
          description="Tempo máximo de espera pelo pagamento PIX antes de expirar o pedido"
        >
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="1"
              max="120"
              value={config.paymentTimeoutMinutes || 30}
              onChange={(e) => updateField("paymentTimeoutMinutes", parseInt(e.target.value) || 30)}
              className="w-32 bg-zinc-900 border-zinc-700"
            />
            <span className="text-zinc-400">minutos</span>
          </div>
          <p className="text-xs text-zinc-500">Recomendado: 30 minutos</p>
        </SettingCard>

        {/* Timeout de Inatividade */}
        <SettingCard
          icon={Timer}
          iconColor="bg-amber-500/20 text-amber-400"
          title="Inatividade do Carrinho"
          description="Tempo de inatividade antes de fechar automaticamente o canal do carrinho"
        >
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="1"
              max="60"
              value={config.cartInactivityMinutes || 10}
              onChange={(e) => updateField("cartInactivityMinutes", parseInt(e.target.value) || 10)}
              className="w-32 bg-zinc-900 border-zinc-700"
            />
            <span className="text-zinc-400">minutos</span>
          </div>
          <p className="text-xs text-zinc-500">Recomendado: 10 minutos</p>
        </SettingCard>

        {/* Tempo de Fechamento Pós-Entrega */}
        <SettingCard
          icon={Zap}
          iconColor="bg-emerald-500/20 text-emerald-400"
          title="Fechamento Pós-Entrega"
          description="Tempo para fechar o canal após a entrega ser confirmada"
        >
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="1"
              max="30"
              value={config.deliveryCloseMinutes || 5}
              onChange={(e) => updateField("deliveryCloseMinutes", parseInt(e.target.value) || 5)}
              className="w-32 bg-zinc-900 border-zinc-700"
            />
            <span className="text-zinc-400">minutos</span>
          </div>
          <p className="text-xs text-zinc-500">Recomendado: 5 minutos</p>
        </SettingCard>

        {/* Intervalo de Verificação */}
        <SettingCard
          icon={RefreshCw}
          iconColor="bg-purple-500/20 text-purple-400"
          title="Intervalo de Verificação"
          description="Intervalo entre verificações de status do pagamento"
        >
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min="3"
              max="30"
              value={config.paymentCheckInterval || 5}
              onChange={(e) => updateField("paymentCheckInterval", parseInt(e.target.value) || 5)}
              className="w-32 bg-zinc-900 border-zinc-700"
            />
            <span className="text-zinc-400">segundos</span>
          </div>
          <p className="text-xs text-zinc-500">Recomendado: 5 segundos</p>
        </SettingCard>
      </motion.div>

      {/* Valores Section */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          Valores e Limites
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Preço por 1000 Robux */}
          <SettingCard
            icon={DollarSign}
            iconColor="bg-emerald-500/20 text-emerald-400"
            title="Preço por 1000 Robux"
            description="Valor em reais cobrado por cada 1000 Robux vendidos"
          >
            <div className="flex items-center gap-4">
              <span className="text-zinc-400">R$</span>
              <Input
                type="number"
                step="0.01"
                min="1"
                value={config.pricePerK?.toFixed(2) || "27.99"}
                onChange={(e) => updateField("pricePerK", parseFloat(e.target.value) || 27.99)}
                className="w-32 bg-zinc-900 border-zinc-700"
              />
            </div>
          </SettingCard>

          {/* Pedido Mínimo */}
          <SettingCard
            icon={Gauge}
            iconColor="bg-cyan-500/20 text-cyan-400"
            title="Pedido Mínimo"
            description="Quantidade mínima de Robux por pedido"
          >
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="100"
                step="100"
                value={config.minOrderAmount || 1000}
                onChange={(e) => updateField("minOrderAmount", parseInt(e.target.value) || 1000)}
                className="w-32 bg-zinc-900 border-zinc-700"
              />
              <span className="text-zinc-400">Robux</span>
            </div>
          </SettingCard>

          {/* Pedido Máximo */}
          <SettingCard
            icon={Shield}
            iconColor="bg-red-500/20 text-red-400"
            title="Pedido Máximo"
            description="Quantidade máxima de Robux por pedido (limite de segurança)"
          >
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="1000"
                step="1000"
                value={config.maxOrderAmount || 100000}
                onChange={(e) => updateField("maxOrderAmount", parseInt(e.target.value) || 100000)}
                className="w-32 bg-zinc-900 border-zinc-700"
              />
              <span className="text-zinc-400">Robux</span>
            </div>
          </SettingCard>

          {/* Taxa do Roblox */}
          <SettingCard
            icon={DollarSign}
            iconColor="bg-amber-500/20 text-amber-400"
            title="Taxa do Roblox"
            description="Porcentagem da taxa cobrada pelo Roblox nas transações"
          >
            <div className="flex items-center gap-4">
              <Input
                type="number"
                min="0"
                max="50"
                value={config.robloxTaxPercent || 30}
                onChange={(e) => updateField("robloxTaxPercent", parseInt(e.target.value) || 30)}
                className="w-32 bg-zinc-900 border-zinc-700"
              />
              <span className="text-zinc-400">%</span>
            </div>
            <p className="text-xs text-zinc-500">Padrão do Roblox: 30%</p>
          </SettingCard>
        </div>
      </motion.div>

      {/* Toggles Section */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-400" />
          Funcionalidades
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Auto-entrega */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Entrega Automática</h3>
                <p className="text-sm text-zinc-400">
                  Tentar entregar automaticamente após pagamento confirmado
                </p>
              </div>
            </div>
            <Switch
              checked={config.autoDeliveryEnabled !== false}
              onCheckedChange={(checked) => updateField("autoDeliveryEnabled", checked)}
            />
          </div>

          {/* Verificação de Gamepass */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Verificação de Entrega</h3>
                <p className="text-sm text-zinc-400">
                  Verificar posse das gamepasses antes de confirmar entrega manual
                </p>
              </div>
            </div>
            <Switch
              checked={config.verifyDeliveryEnabled !== false}
              onCheckedChange={(checked) => updateField("verifyDeliveryEnabled", checked)}
            />
          </div>

          {/* Cupons */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-pink-500/20 text-pink-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-white">Sistema de Cupons</h3>
                <p className="text-sm text-zinc-400">
                  Permitir uso de cupons de desconto nos pedidos
                </p>
              </div>
            </div>
            <Switch
              checked={config.couponsEnabled !== false}
              onCheckedChange={(checked) => updateField("couponsEnabled", checked)}
            />
          </div>

          {/* Logs Detalhados */}
          <div className="glass-card p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Logs Detalhados</h3>
                <p className="text-sm text-zinc-400">
                  Registrar logs detalhados de debug (afeta performance)
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

      {/* Save Button Bottom */}
      <motion.div variants={item} className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          size="lg"
          className="bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-white border-0 px-8"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Save className="w-5 h-5 mr-2" />
          )}
          {saving ? "Salvando..." : "Salvar Todas as Alterações"}
        </Button>
      </motion.div>
    </motion.div>
  );
}
