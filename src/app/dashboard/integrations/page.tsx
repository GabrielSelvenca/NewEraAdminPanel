'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '@/lib/api';
import { Loader2, Link2, Unlink, CheckCircle2, XCircle, AlertCircle, Copy, RefreshCw, Eye, EyeOff, Save, CreditCard } from 'lucide-react';

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
  cpfCnpj?: string;
  hasMercadoPagoAccessToken?: boolean;
}

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
  const [mpCpfCnpj, setMpCpfCnpj] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [savingMp, setSavingMp] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    loadStatus();
    loadCurrentUser();
  }, []);

  const loadStatus = async () => {
    try {
      const response = await api.get<LinkStatus>('/api/link/status');
      setStatus(response.data);
    } catch (err) {
      setError('Não foi possível carregar o status das integrações');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await api.getCurrentUser();
      setCurrentUser(user);
      setMpCpfCnpj(user.cpfCnpj || '');
    } catch (err) {
      }
  };

  // ==================== DISCORD ====================

  const generateDiscordCode = async () => {
    try {
      setGeneratingCode(true);
      setError(null);
      const response = await api.post<DiscordCodeResponse>('/api/link/discord/generate-code', {});
      setDiscordCode(response.data.code);
      setSuccess('Código gerado! Use o comando /vincular no bot do Discord.');
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
      setTimeout(() => setSuccess(null), 2000);
    }
  };

  const unlinkDiscord = async () => {
    try {
      setUnlinkingDiscord(true);
      setError(null);
      await api.delete('/api/link/discord');
      setSuccess('Discord desvinculado com sucesso!');
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
      setSuccess('Roblox vinculado com sucesso!');
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
      setSuccess('Roblox desvinculado com sucesso!');
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
      setSuccess('Cookie salvo e saldo atualizado automaticamente!');
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

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  const saveMercadoPago = async () => {
    if (!mpCpfCnpj.trim()) {
      setError('CPF/CNPJ é obrigatório');
      return;
    }

    if (!currentUser) return;

    try {
      setSavingMp(true);
      setError(null);

      const updateData: Record<string, string | boolean> = {
        cpfCnpj: mpCpfCnpj.replace(/\D/g, ''),
        mercadoPagoSandbox: false
      };

      if (mpAccessToken.trim()) {
        updateData.mercadoPagoAccessToken = mpAccessToken.trim();
      }

      await api.updateUser(parseInt(currentUser.id), updateData);
      setSuccess('Mercado Pago configurado com sucesso!');
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Integrações</h1>
        <p className="text-zinc-400">
          Vincule suas contas para receber pedidos e pagamentos
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">×</button>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400">
          <CheckCircle2 className="h-5 w-5" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)} className="ml-auto text-green-400 hover:text-green-300">×</button>
        </div>
      )}

      {/* Discord e Roblox - Dois cards lado a lado */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Discord */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <svg className="h-6 w-6 text-[#5865F2]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                </svg>
                Discord
              </CardTitle>
              {status?.discord.linked ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Vinculado
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                  <XCircle className="h-3 w-3 mr-1" />
                  Não vinculado
                </Badge>
              )}
            </div>
            <CardDescription className="text-zinc-500">
              Vincule via comando no bot do Discord
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status?.discord.linked ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">{status.discord.username}</p>
                    <p className="text-sm text-zinc-500">ID: {status.discord.id}</p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={unlinkDiscord}
                  disabled={unlinkingDiscord}
                >
                  {unlinkingDiscord ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Unlink className="h-4 w-4 mr-2" />
                  )}
                  Desvincular
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {discordCode ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                      <code className="text-2xl font-mono font-bold text-emerald-400 flex-1 text-center tracking-widest">
                        {discordCode}
                      </code>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={copyCode}
                        className="border-zinc-600 hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-emerald-400 transition-all cursor-pointer"
                        title="Copiar código"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500 text-center">
                      Use <code className="bg-zinc-800 px-1 rounded">/vincular {discordCode}</code> no bot
                    </p>
                    <Button
                      variant="outline"
                      className="w-full border-zinc-700"
                      onClick={generateDiscordCode}
                      disabled={generatingCode}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Novo código
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                    onClick={generateDiscordCode}
                    disabled={generatingCode}
                  >
                    {generatingCode ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Link2 className="h-4 w-4 mr-2" />
                    )}
                    Gerar Código
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Roblox */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <svg className="h-6 w-6 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5.164 0L.16 18.928 18.836 24l5.004-18.928L5.164 0zm9.086 15.372l-5.252-1.392 1.392-5.252 5.252 1.392-1.392 5.252z"/>
                </svg>
                Roblox
              </CardTitle>
              {status?.roblox.linked ? (
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Vinculado
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                  <XCircle className="h-3 w-3 mr-1" />
                  Não vinculado
                </Badge>
              )}
            </div>
            <CardDescription className="text-zinc-500">
              Vincule informando seu username do Roblox
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status?.roblox.linked ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">{status.roblox.username}</p>
                    <p className="text-sm text-zinc-500">ID: {status.roblox.id}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-emerald-400">
                        Saldo: {status.roblox.balance.toLocaleString()} Robux
                      </p>
                      {status.roblox.hasCookie && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshBalance}
                          disabled={refreshingBalance}
                          className="h-6 px-2 text-xs hover:bg-emerald-500/20"
                          title="Atualizar saldo"
                        >
                          {refreshingBalance ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                        </Button>
                      )}
                    </div>
                    {status.roblox.hasCookie ? (
                      <p className="text-xs text-emerald-500">✓ Saldo automático ativo</p>
                    ) : (
                      <p className="text-xs text-yellow-500">⚠ Configure o cookie para saldo automático</p>
                    )}
                  </div>
                </div>
                
                {!status.roblox.hasCookie && (
                  <div className="space-y-2">
                    <p className="text-xs text-zinc-400">Cole seu cookie .ROBLOSECURITY:</p>
                    <div className="flex gap-2">
                      <Input
                        type="password"
                        placeholder="Cookie .ROBLOSECURITY"
                        value={robloxCookie}
                        onChange={(e) => setRobloxCookie(e.target.value)}
                        className="bg-zinc-800 border-zinc-700 text-xs"
                      />
                      <Button
                        variant="outline"
                        onClick={saveRobloxCookie}
                        disabled={savingCookie}
                        className="border-zinc-700"
                      >
                        {savingCookie ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
                      </Button>
                    </div>
                  </div>
                )}

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={unlinkRoblox}
                  disabled={unlinkingRoblox}
                >
                  {unlinkingRoblox ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Unlink className="h-4 w-4 mr-2" />
                  )}
                  Desvincular
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <Input
                  placeholder="Username do Roblox"
                  value={robloxUsername}
                  onChange={(e) => setRobloxUsername(e.target.value)}
                  className="bg-zinc-800 border-zinc-700"
                  onKeyDown={(e) => e.key === 'Enter' && linkRoblox()}
                />
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  onClick={linkRoblox}
                  disabled={linkingRoblox}
                >
                  {linkingRoblox ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Link2 className="h-4 w-4 mr-2" />
                  )}
                  Vincular Roblox
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Mercado Pago - Card grande */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-white">
              <CreditCard className="h-6 w-6 text-[#00B1EA]" />
              Mercado Pago
            </CardTitle>
            {status?.mercadoPago.configured ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Configurado
              </Badge>
            ) : (
              <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
                <XCircle className="h-3 w-3 mr-1" />
                Não configurado
              </Badge>
            )}
          </div>
          <CardDescription className="text-zinc-500">
            Configure sua conta Mercado Pago para receber pagamentos PIX
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cpfCnpj" className="text-zinc-300">CPF/CNPJ *</Label>
              <Input
                id="cpfCnpj"
                value={mpCpfCnpj}
                onChange={(e) => setMpCpfCnpj(formatCpfCnpj(e.target.value))}
                placeholder="000.000.000-00"
                className="bg-zinc-800 border-zinc-700"
              />
              <p className="text-xs text-zinc-500">Usado para identificação nas cobranças</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accessToken" className="text-zinc-300">Access Token {status?.mercadoPago.configured ? '(deixe vazio para manter)' : '*'}</Label>
              <div className="flex gap-2">
                <Input
                  id="accessToken"
                  type={showToken ? 'text' : 'password'}
                  value={mpAccessToken}
                  onChange={(e) => setMpAccessToken(e.target.value)}
                  placeholder={status?.mercadoPago.configured ? '••••••••••••••••' : 'APP_USR-...'}
                  className="bg-zinc-800 border-zinc-700 flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowToken(!showToken)}
                  className="border-zinc-700"
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-zinc-500">
                Obtenha em mercadopago.com.br → Seu negócio → Credenciais
              </p>
            </div>
          </div>

          <Button
            onClick={saveMercadoPago}
            disabled={savingMp}
            className="bg-[#00B1EA] hover:bg-[#009ACC]"
          >
            {savingMp ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Salvar Configurações
          </Button>

          {/* Tutorial */}
          <div className="border-t border-zinc-800 pt-6">
            <h4 className="font-semibold text-white mb-4">📘 Como obter seu Access Token</h4>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#00B1EA] text-white rounded-full text-sm font-bold mb-2">1</span>
                <p className="text-sm text-zinc-300">Acesse <a href="https://www.mercadopago.com.br" target="_blank" rel="noopener noreferrer" className="text-[#00B1EA] hover:underline">mercadopago.com.br</a></p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#00B1EA] text-white rounded-full text-sm font-bold mb-2">2</span>
                <p className="text-sm text-zinc-300">Vá em Seu negócio → Configurações → Credenciais</p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#00B1EA] text-white rounded-full text-sm font-bold mb-2">3</span>
                <p className="text-sm text-zinc-300">Ative as credenciais de <strong>produção</strong></p>
              </div>
              <div className="p-3 bg-zinc-800/50 rounded-lg">
                <span className="inline-flex items-center justify-center w-6 h-6 bg-[#00B1EA] text-white rounded-full text-sm font-bold mb-2">4</span>
                <p className="text-sm text-zinc-300">Copie o Access Token (APP_USR-...)</p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
              <p className="text-sm text-green-400">
                ✅ <strong>Não precisa ter site!</strong> Use qualquer URL válida (link do Discord, Twitter, etc.)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tutorial Cookie Roblox */}
      <Card className="bg-zinc-900 border-zinc-800 border-yellow-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <svg className="h-5 w-5 text-yellow-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
            Como pegar o Cookie do Roblox (Saldo Automático)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-sm font-bold mb-2">1</span>
              <p className="text-sm text-zinc-300">Acesse <a href="https://www.roblox.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">roblox.com</a> e faça login</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-sm font-bold mb-2">2</span>
              <p className="text-sm text-zinc-300">Pressione <code className="bg-zinc-700 px-1 rounded">F12</code> para abrir DevTools</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-sm font-bold mb-2">3</span>
              <p className="text-sm text-zinc-300">Vá em Application → Cookies → roblox.com</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-sm font-bold mb-2">4</span>
              <p className="text-sm text-zinc-300">Encontre <code className="bg-zinc-700 px-1 rounded text-red-400">.ROBLOSECURITY</code></p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-sm font-bold mb-2">5</span>
              <p className="text-sm text-zinc-300">Clique duas vezes no valor e copie</p>
            </div>
            <div className="p-3 bg-zinc-800/50 rounded-lg">
              <span className="inline-flex items-center justify-center w-6 h-6 bg-emerald-500 text-white rounded-full text-sm font-bold mb-2">6</span>
              <p className="text-sm text-zinc-300">Cole no campo acima e salve</p>
            </div>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span><strong>Atenção:</strong> Nunca compartilhe seu cookie! Ele dá acesso total à sua conta Roblox.</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
