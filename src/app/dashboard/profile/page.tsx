"use client";

import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/lib/user-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Loader2, User, Lock, Save, Eye, EyeOff, CheckCircle, 
  AlertCircle, Shield, Crown, Link2, Unlink, Copy, 
  RefreshCw, ExternalLink, Gamepad2, MessageSquare, CreditCard,
  UserCog, KeyRound
} from "lucide-react";

type TabType = 'account' | 'integrations';

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

interface CurrentUser {
  id: string;
  hasMercadoPagoAccessToken?: boolean;
}

const roleConfig: Record<string, { label: string; color: string; gradient: string; icon: React.ElementType }> = {
  admin: { label: "Administrador", color: "text-red-400", gradient: "from-red-500 to-orange-500", icon: Crown },
  gerente: { label: "Gerente", color: "text-purple-400", gradient: "from-purple-500 to-pink-500", icon: Shield },
  auxiliar: { label: "Auxiliar", color: "text-blue-400", gradient: "from-blue-500 to-cyan-500", icon: User },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
  const user = useContext(UserContext);
  const [activeTab, setActiveTab] = useState<TabType>('account');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Integrations
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [integrationsLoading, setIntegrationsLoading] = useState(true);
  const [discordCode, setDiscordCode] = useState<string | null>(null);
  const [generatingCode, setGeneratingCode] = useState(false);
  const [unlinkingDiscord, setUnlinkingDiscord] = useState(false);
  const [robloxUsername, setRobloxUsername] = useState('');
  const [robloxCookie, setRobloxCookie] = useState('');
  const [linkingRoblox, setLinkingRoblox] = useState(false);
  const [savingCookie, setSavingCookie] = useState(false);
  const [refreshingBalance, setRefreshingBalance] = useState(false);
  const [unlinkingRoblox, setUnlinkingRoblox] = useState(false);
  const [mpAccessToken, setMpAccessToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [savingMp, setSavingMp] = useState(false);
  const [currentUserData, setCurrentUserData] = useState<CurrentUser | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
    }
  }, [user]);

  useEffect(() => {
    loadIntegrations();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadIntegrations = async () => {
    try {
      const [statusRes, userData] = await Promise.all([
        api.get<LinkStatus>('/api/link/status'),
        api.getCurrentUser().catch(() => null)
      ]);
      setStatus(statusRes.data);
      setCurrentUserData(userData);
    } catch {
      // Silently fail
    } finally {
      setIntegrationsLoading(false);
    }
  };

  // ==================== ACCOUNT HANDLERS ====================
  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      await api.updateUser(parseInt(user.id), {
        name: name.trim() || undefined,
        username: username.trim() || undefined,
      });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao atualizar' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A senha deve ter no mínimo 6 caracteres' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.changePassword(parseInt(user.id), {
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao alterar senha' });
    } finally {
      setLoading(false);
    }
  };

  // ==================== DISCORD HANDLERS ====================
  const generateDiscordCode = async () => {
    try {
      setGeneratingCode(true);
      setMessage(null);
      const response = await api.post<{ code: string }>('/api/link/discord/generate-code', {});
      setDiscordCode(response.data.code);
      setMessage({ type: 'success', text: 'Código gerado! Use /vincular no Discord.' });
    } catch (err) {
      const error = err as { message?: string };
      setMessage({ type: 'error', text: error.message || 'Erro ao gerar código' });
    } finally {
      setGeneratingCode(false);
    }
  };

  const copyCode = () => {
    if (discordCode) {
      navigator.clipboard.writeText(discordCode);
      setMessage({ type: 'success', text: 'Código copiado!' });
    }
  };

  const unlinkDiscord = async () => {
    try {
      setUnlinkingDiscord(true);
      await api.delete('/api/link/discord');
      setMessage({ type: 'success', text: 'Discord desvinculado!' });
      setDiscordCode(null);
      await loadIntegrations();
    } catch (err) {
      const error = err as { message?: string };
      setMessage({ type: 'error', text: error.message || 'Erro ao desvincular' });
    } finally {
      setUnlinkingDiscord(false);
    }
  };

  // ==================== ROBLOX HANDLERS ====================
  const linkRoblox = async () => {
    if (!robloxUsername.trim()) {
      setMessage({ type: 'error', text: 'Digite o username' });
      return;
    }

    try {
      setLinkingRoblox(true);
      await api.post('/api/link/roblox', { username: robloxUsername.trim() });
      setMessage({ type: 'success', text: 'Roblox vinculado!' });
      setRobloxUsername('');
      await loadIntegrations();
    } catch (err) {
      const error = err as { message?: string };
      setMessage({ type: 'error', text: error.message || 'Erro ao vincular' });
    } finally {
      setLinkingRoblox(false);
    }
  };

  const saveRobloxCookie = async () => {
    if (!robloxCookie.trim()) {
      setMessage({ type: 'error', text: 'Cole o cookie' });
      return;
    }

    try {
      setSavingCookie(true);
      await api.post('/api/link/roblox/cookie', { cookie: robloxCookie.trim() });
      setMessage({ type: 'success', text: 'Cookie salvo!' });
      setRobloxCookie('');
      await loadIntegrations();
    } catch (err) {
      const error = err as { message?: string };
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar cookie' });
    } finally {
      setSavingCookie(false);
    }
  };

  const refreshBalance = async () => {
    try {
      setRefreshingBalance(true);
      await api.post('/api/link/roblox/refresh-balance', {});
      await loadIntegrations();
      setMessage({ type: 'success', text: 'Saldo atualizado!' });
    } catch (err) {
      const error = err as { message?: string };
      setMessage({ type: 'error', text: error.message || 'Erro ao atualizar' });
    } finally {
      setRefreshingBalance(false);
    }
  };

  const unlinkRoblox = async () => {
    try {
      setUnlinkingRoblox(true);
      await api.delete('/api/link/roblox');
      setMessage({ type: 'success', text: 'Roblox desvinculado!' });
      await loadIntegrations();
    } catch (err) {
      const error = err as { message?: string };
      setMessage({ type: 'error', text: error.message || 'Erro ao desvincular' });
    } finally {
      setUnlinkingRoblox(false);
    }
  };

  // ==================== MERCADO PAGO HANDLERS ====================
  const saveMercadoPago = async () => {
    if (!currentUserData) return;

    try {
      setSavingMp(true);
      setMessage(null);

      const updateData: Record<string, string | boolean> = {
        mercadoPagoSandbox: false
      };

      if (mpAccessToken.trim()) {
        updateData.mercadoPagoAccessToken = mpAccessToken.trim();
      }

      await api.updateUser(parseInt(currentUserData.id), updateData);
      setMessage({ type: 'success', text: 'Mercado Pago configurado!' });
      setMpAccessToken('');
      await loadIntegrations();
    } catch (err) {
      const error = err as { message?: string };
      setMessage({ type: 'error', text: error.message || 'Erro ao salvar' });
    } finally {
      setSavingMp(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const roleInfo = roleConfig[user.role] || roleConfig.auxiliar;
  const RoleIcon = roleInfo.icon;

  // ==================== TAB COMPONENTS ====================
  const AccountTab = () => (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Profile Info */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <UserCog className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Informações Pessoais</h3>
            <p className="text-xs text-zinc-500">Atualize seu nome e usuário</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Nome Completo</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="bg-zinc-800 border-zinc-600"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Nome de Usuário</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu.usuario"
              className="bg-zinc-800 border-zinc-600"
            />
          </div>

          <Button
            onClick={handleUpdateProfile}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {/* Password */}
      <div className="glass-card p-6 space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-zinc-800">
          <div className="p-2 rounded-lg bg-amber-500/10">
            <KeyRound className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Alterar Senha</h3>
            <p className="text-xs text-zinc-500">Mantenha sua conta segura</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Senha Atual</Label>
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Nova Senha</Label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-600 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-zinc-400 text-xs uppercase">Confirmar Nova Senha</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="bg-zinc-800 border-zinc-600"
            />
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={loading || !newPassword || !confirmPassword}
            className="w-full bg-amber-600 hover:bg-amber-700"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
            Alterar Senha
          </Button>
        </div>
      </div>
    </motion.div>
  );

  const IntegrationsTab = () => (
    <motion.div 
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
    >
      {integrationsLoading ? (
        <div className="lg:col-span-3 flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
        </div>
      ) : (
        <>
          {/* Discord */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#5865F2]/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-[#5865F2]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Discord</h3>
                  <p className="text-xs text-zinc-500">Receber pedidos</p>
                </div>
              </div>
              <Badge className={status?.discord.linked ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-400"}>
                {status?.discord.linked ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            {status?.discord.linked ? (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg">
                  <p className="text-xs text-zinc-500">Conta vinculada</p>
                  <p className="text-sm font-medium text-white">{status.discord.username}</p>
                </div>
                <Button
                  onClick={unlinkDiscord}
                  disabled={unlinkingDiscord}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {unlinkingDiscord ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4 mr-2" />}
                  Desvincular
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {discordCode ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input value={discordCode} readOnly className="bg-zinc-800 border-zinc-600 font-mono text-center" />
                      <Button onClick={copyCode} variant="outline" size="icon" className="border-zinc-600">
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500 text-center">Use /vincular no bot</p>
                  </div>
                ) : (
                  <Button onClick={generateDiscordCode} disabled={generatingCode} className="w-full bg-[#5865F2] hover:bg-[#4752C4]">
                    {generatingCode ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                    Gerar Código
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Roblox */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <Gamepad2 className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Roblox</h3>
                  <p className="text-xs text-zinc-500">Entregar Robux</p>
                </div>
              </div>
              <Badge className={status?.roblox.linked ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-400"}>
                {status?.roblox.linked ? "Conectado" : "Desconectado"}
              </Badge>
            </div>

            {status?.roblox.linked ? (
              <div className="space-y-3">
                <div className="p-3 bg-zinc-800/50 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-500">Conta</span>
                    <span className="text-sm font-medium text-white">{status.roblox.username}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-zinc-500">Saldo</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-emerald-400">R$ {status.roblox.balance.toLocaleString()}</span>
                      <button onClick={refreshBalance} disabled={refreshingBalance} className="text-zinc-500 hover:text-white">
                        <RefreshCw className={`w-3.5 h-3.5 ${refreshingBalance ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-zinc-500">Cookie</span>
                    <Badge className={status.roblox.hasCookie ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}>
                      {status.roblox.hasCookie ? "Configurado" : "Pendente"}
                    </Badge>
                  </div>
                </div>
                
                {!status.roblox.hasCookie && (
                  <div className="space-y-2">
                    <Input
                      value={robloxCookie}
                      onChange={(e) => setRobloxCookie(e.target.value)}
                      placeholder=".ROBLOSECURITY cookie"
                      type="password"
                      className="bg-zinc-800 border-zinc-600 text-xs"
                    />
                    <Button onClick={saveRobloxCookie} disabled={savingCookie} size="sm" className="w-full">
                      {savingCookie ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar Cookie"}
                    </Button>
                  </div>
                )}
                
                <Button
                  onClick={unlinkRoblox}
                  disabled={unlinkingRoblox}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                >
                  {unlinkingRoblox ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlink className="w-4 h-4 mr-2" />}
                  Desvincular
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  placeholder="Username do Roblox"
                  className="bg-zinc-800 border-zinc-600"
                />
                <Button onClick={linkRoblox} disabled={linkingRoblox} className="w-full bg-red-600 hover:bg-red-700">
                  {linkingRoblox ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                  Vincular Conta
                </Button>
              </div>
            )}
          </div>

          {/* Mercado Pago */}
          <div className="glass-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#00A1E4]/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-[#00A1E4]" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Mercado Pago</h3>
                  <p className="text-xs text-zinc-500">Receber pagamentos</p>
                </div>
              </div>
              <Badge className={status?.mercadoPago.configured ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-400"}>
                {status?.mercadoPago.configured ? "Configurado" : "Pendente"}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs">Access Token</Label>
                <div className="flex gap-2">
                  <Input
                    type={showToken ? 'text' : 'password'}
                    value={mpAccessToken}
                    onChange={(e) => setMpAccessToken(e.target.value)}
                    placeholder={status?.mercadoPago.configured ? '••••••••••••' : 'APP_USR-...'}
                    className="bg-zinc-800 border-zinc-600 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowToken(!showToken)}
                    className="border-zinc-600"
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
              
              <Button onClick={saveMercadoPago} disabled={savingMp} className="w-full bg-[#00A1E4] hover:bg-[#0090CC]">
                {savingMp ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                {status?.mercadoPago.configured ? 'Atualizar' : 'Configurar'}
              </Button>
              
              <a
                href="https://www.mercadopago.com.br/developers/panel/app"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300"
              >
                <ExternalLink className="w-3 h-3" />
                Obter credenciais
              </a>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );

  return (
    <motion.div 
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header with Profile Card */}
      <motion.div variants={item} className="glass-card overflow-hidden relative">
        {/* Banner suave com padrão geométrico */}
        <div className="h-24 relative">
          <div className={`absolute inset-0 bg-gradient-to-r ${roleInfo.gradient} opacity-40`} />
          <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/50 to-transparent" />
        </div>
        <div className="px-6 pb-6 -mt-12 relative z-10">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-[#0c0c0e]">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
              <p className="text-zinc-500">@{user.username}</p>
            </div>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${roleInfo.gradient} text-white text-xs font-medium shadow-lg`}>
              <RoleIcon className="w-3.5 h-3.5" />
              {roleInfo.label}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 p-1 bg-zinc-800/50 rounded-xl w-fit">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'account'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <UserCog className="w-4 h-4" />
              Minha Conta
            </button>
            <button
              onClick={() => setActiveTab('integrations')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'integrations'
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Link2 className="w-4 h-4" />
              Integrações
            </button>
          </div>
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
      <motion.div variants={item}>
        <AnimatePresence mode="wait">
          {activeTab === 'account' ? (
            <AccountTab key="account" />
          ) : (
            <IntegrationsTab key="integrations" />
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
