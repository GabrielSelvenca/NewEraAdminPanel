'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { 
  Loader2, Link2, Unlink, CheckCircle2, XCircle, AlertCircle, 
  Copy, RefreshCw, Eye, EyeOff, Save, ExternalLink, Sparkles
} from 'lucide-react';

interface LinkStatus {
  discord: {
    linked: boolean;
    id: string | null;
    username: string | null;
  };
  roblox: {
    linked: boolean;
    id: number | null;
    username: string | null;
    balance: number;
    hasCookie: boolean;
  };
  mercadoPago: {
    configured: boolean;
    sandbox: boolean;
  };
}

interface DiscordCodeResponse {
  code: string;
  expiresIn: number;
  instructions: string;
}

interface CurrentUser {
  id: string;
  hasMercadoPagoAccessToken?: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function IntegrationsPage() {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Discord
  const [discordCode, setDiscordCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [unlinkingDiscord, setUnlinkingDiscord] = useState(false);
  
  // Roblox
  const [robloxUsername, setRobloxUsername] = useState('');
  const [robloxCookie, setRobloxCookie] = useState('');
  const [linkingRoblox, setLinkingRoblox] = useState(false);
  const [savingCookie, setSavingCookie] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [unlinkingRoblox, setUnlinkingRoblox] = useState(false);

  // Mercado Pago
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [savingMp, setSavingMp] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    loadStatus();
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const loadStatus = async () => {
    try {
      const response = await api.get<LinkStatus>('/api/link/status');
      setStatus(response.data);
    } catch {
      setError('Não foi possível carregar o status das integrações');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
    } catch {
      // Silently fail
    }
  };

  // ==================== DISCORD ====================
  const generateDiscordCode = async () => {
    try {
      setGeneratingCode(true);
      setError(null);
      const response = await api.post<DiscordCodeResponse>('/api/link/discord/generate-code', {});
      setDiscordCode(response.data.code);
      setSuccess('Código gerado! Use /vincular no Discord.');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao gerar código');
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = () => {
    if (discordCode) {
      navigator.clipboard.writeText(discordCode);
      setSuccess('Código copiado!');
    }
  };

  const unlinkDiscord = async () => {
    try {
      setUnlinkingDiscord(true);
      setError(null);
      await api.delete('/api/link/discord');
      setSuccess('Discord desvinculado!');
      setDiscordCode(null);
      await loadStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao desvincular Discord');
    } finally {
      setUnlinkingDiscord(false);
    }
  };

  // ==================== ROBLOX ====================
  const linkRoblox = async () => {
    if (!robloxUsername.trim()) {
      setError('Digite seu username do Roblox');
      return;
    }

    try {
      setLinkingRoblox(true);
      setError(null);
      await api.post('/api/link/roblox/link', { username: robloxUsername.trim() });
      setSuccess('Roblox vinculado!');
      setRobloxUsername('');
      await loadStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao vincular Roblox');
    } finally {
      setLinkingRoblox(false);
    }
  };

  const unlinkRoblox = async () => {
    try {
      setUnlinkingRoblox(true);
      setError(null);
      await api.delete('/api/link/roblox');
      setSuccess('Roblox desvinculado!');
      await loadStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao desvincular Roblox');
    } finally {
      setUnlinkingRoblox(false);
    }
  };

  const saveRobloxCookie = async () => {
    if (!robloxCookie.trim()) {
      setError('Cole o cookie .ROBLOSECURITY');
      return;
    }

    try {
      setSavingCookie(true);
      setError(null);
      await api.post('/api/link/roblox/cookie', { cookie: robloxCookie.trim() });
      setSuccess('Cookie salvo! Saldo atualizado automaticamente.');
      setRobloxCookie('');
      await loadStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao salvar cookie');
    } finally {
      setSavingCookie(false);
    }
  };

  const refreshBalance = async () => {
    try {
      setRefreshingBalance(true);
      setError(null);
      await api.post('/api/link/roblox/refresh-balance', {});
      setSuccess('Saldo atualizado!');
      await loadStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao atualizar saldo');
    } finally {
      setRefreshingBalance(false);
    }
  };

  // ==================== MERCADO PAGO ====================
  const saveMercadoPago = async () => {
    if (!mpAccessToken.trim()) {
      setError('Access Token é obrigatório');
      return;
    }

    if (!currentUser) return;

    try {
      setSavingMp(true);
      setError(null);

      const updateData: Record<string, string | boolean> = {
        mercadoPagoAccessToken: mpAccessToken.trim(),
        mercadoPagoSandbox: false
      };

      await api.updateUser(parseInt(currentUser.id), updateData);
      setSuccess('Mercado Pago configurado!');
      setMpAccessToken('');
      await loadStatus();
      await loadCurrentUser();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao salvar configurações');
    } finally {
      setSavingMp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const IntegrationCard = ({ 
    title, 
    icon, 
    iconColor, 
    linked, 
    children 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    iconColor: string; 
    linked: boolean; 
    children: React.ReactNode;
  }) => (
    <div className="glass-card overflow-hidden">
      <div className={`h-1 bg-gradient-to-r ${iconColor}`} />
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${iconColor} bg-opacity-20`}>
              {icon}
            </div>
            <h3 className="font-semibold text-white">{title}</h3>
          </div>
          <Badge className={linked 
            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
            : "bg-zinc-700/50 text-zinc-400 border-zinc-600"
          }>
            {linked ? <><CheckCircle2 className="w-3 h-3 mr-1" /> Vinculado</> : <><XCircle className="w-3 h-3 mr-1" /> Não vinculado</>}
          </Badge>
        </div>
        {children}
      </div>
    </div>
  );

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          Integrações
        </h1>
        <p className="text-zinc-500 text-sm mt-1">
          Conecte suas contas para receber pedidos e pagamentos
        </p>
      </motion.div>

      {/* Toast Messages */}
      {(error || success) && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
            error 
              ? 'bg-red-500/10 text-red-400 border border-red-500/20' 
              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
          }`}
        >
          {error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{error || success}</span>
        </motion.div>
      )}

      {/* Integration Cards Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {/* Discord */}
        <motion.div variants={item}>
          <IntegrationCard
            title="Discord"
            icon={
              <svg className="h-5 w-5 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            }
            iconColor="from-[#5865F2]/20 to-[#5865F2]/5"
            linked={status?.discord.linked || false}
          >
            {status?.discord.linked ? (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="font-medium text-white">{status.discord.username}</p>
                  <p className="text-xs text-zinc-500">ID: {status.discord.id}</p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={unlinkDiscord}
                  disabled={unlinkingDiscord}
                >
                  {unlinkingDiscord ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Unlink className="h-4 w-4 mr-2" />}
                  Desvincular
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {discordCode ? (
                  <>
                    <div className="flex items-center gap-2 p-3 bg-zinc-800/50 rounded-lg">
                      <code className="text-xl font-mono font-bold text-cyan-400 flex-1 text-center tracking-widest">
                        {discordCode}
                      </code>
                      <Button variant="ghost" size="icon" onClick={copyCode} className="hover:bg-cyan-500/10">
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500 text-center">
                      Use <code className="bg-zinc-800 px-1 rounded">/vincular {discordCode}</code>
                    </p>
                  </>
                ) : (
                  <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4]" onClick={generateDiscordCode} disabled={generatingCode}>
                    {generatingCode ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                    Gerar Código
                  </Button>
                )}
              </div>
            )}
          </IntegrationCard>
        </motion.div>

        {/* Roblox */}
        <motion.div variants={item}>
          <IntegrationCard
            title="Roblox"
            icon={
              <svg className="h-5 w-5 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M5.164 0L.16 18.928 18.836 24l5.004-18.928L5.164 0zm9.086 15.372l-5.252-1.392 1.392-5.252 5.252 1.392-1.392 5.252z"/>
              </svg>
            }
            iconColor="from-red-500/20 to-red-500/5"
            linked={status?.roblox.linked || false}
          >
            {status?.roblox.linked ? (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="font-medium text-white">{status.roblox.username}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-emerald-400 font-medium">
                      {status.roblox.balance.toLocaleString()} R$
                    </p>
                    {status.roblox.hasCookie && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={refreshBalance}
                        disabled={refreshingBalance}
                        className="h-6 w-6 hover:bg-emerald-500/10"
                      >
                        <RefreshCw className={`h-3 w-3 ${refreshingBalance ? 'animate-spin' : ''}`} />
                      </Button>
                    )}
                  </div>
                  {status.roblox.hasCookie ? (
                    <p className="text-xs text-emerald-500 mt-1">✓ Saldo automático ativo</p>
                  ) : (
                    <p className="text-xs text-amber-500 mt-1">⚠ Configure o cookie</p>
                  )}
                </div>
                
                {!status.roblox.hasCookie && (
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder=".ROBLOSECURITY cookie"
                      value={robloxCookie}
                      onChange={(e) => setRobloxCookie(e.target.value)}
                      className="bg-zinc-800/50 border-zinc-700 text-xs"
                    />
                    <Button variant="outline" size="sm" onClick={saveRobloxCookie} disabled={savingCookie}>
                      {savingCookie ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    </Button>
                  </div>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  className="w-full"
                  onClick={unlinkRoblox}
                  disabled={unlinkingRoblox}
                >
                  {unlinkingRoblox ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Unlink className="h-4 w-4 mr-2" />}
                  Desvincular
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Username do Roblox"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700"
                  onKeyDown={(e) => e.key === 'Enter' && linkRoblox()}
                />
                <Button className="w-full bg-red-600 hover:bg-red-700" onClick={linkRoblox} disabled={linkingRoblox}>
                  {linkingRoblox ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Link2 className="h-4 w-4 mr-2" />}
                  Vincular Roblox
                </Button>
              </div>
            )}
          </IntegrationCard>
        </motion.div>

        {/* Mercado Pago */}
        <motion.div variants={item}>
          <IntegrationCard
            title="Mercado Pago"
            icon={
              <svg className="h-5 w-5 text-[#00B1EA]" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            }
            iconColor="from-[#00B1EA]/20 to-[#00B1EA]/5"
            linked={status?.mercadoPago.configured || false}
          >
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  type={showToken ? 'text' : 'password'}
                  value={mpAccessToken}
                  onChange={(e) => setMpAccessToken(e.target.value)}
                  placeholder={status?.mercadoPago.configured ? '••••••••••••' : 'APP_USR-...'}
                  className="bg-zinc-800/50 border-zinc-700 text-sm"
                />
                <Button variant="ghost" size="icon" onClick={() => setShowToken(!showToken)} className="hover:bg-zinc-700">
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                className="w-full bg-[#00B1EA] hover:bg-[#009ACC]"
                onClick={saveMercadoPago}
                disabled={savingMp || (!mpAccessToken.trim() && !status?.mercadoPago.configured)}
              >
                {savingMp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                {status?.mercadoPago.configured ? 'Atualizar Token' : 'Salvar Token'}
              </Button>
              <a
                href="https://www.mercadopago.com.br/developers/panel/app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1 text-xs text-[#00B1EA] hover:underline"
              >
                <ExternalLink className="w-3 h-3" />
                Obter Access Token
              </a>
            </div>
          </IntegrationCard>
        </motion.div>
      </div>

      {/* Help Section */}
      <motion.div variants={item} className="glass-card p-5">
        <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          Ajuda Rápida
        </h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="p-3 bg-zinc-800/30 rounded-lg">
            <p className="font-medium text-zinc-300 mb-1">Discord</p>
            <p className="text-zinc-500">Gere um código e use <code className="bg-zinc-700 px-1 rounded">/vincular</code> no bot</p>
          </div>
          <div className="p-3 bg-zinc-800/30 rounded-lg">
            <p className="font-medium text-zinc-300 mb-1">Roblox Cookie</p>
            <p className="text-zinc-500">F12 → Application → Cookies → .ROBLOSECURITY</p>
          </div>
          <div className="p-3 bg-zinc-800/30 rounded-lg">
            <p className="font-medium text-zinc-300 mb-1">Mercado Pago</p>
            <p className="text-zinc-500">Seu negócio → Credenciais → Access Token de produção</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
