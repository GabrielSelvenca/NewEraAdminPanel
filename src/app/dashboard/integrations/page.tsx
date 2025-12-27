'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { Loader2, Link2, Unlink, ExternalLink, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
  };
  mercadoPago: {
    configured: boolean;
    sandbox: boolean;
  };
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<LinkStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [linkingDiscord, setLinkingDiscord] = useState(false);
  const [linkingRoblox, setLinkingRoblox] = useState(false);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadStatus();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const provider = urlParams.get('provider');

    if (code && provider) {
      handleOAuthCallback(provider, code, state);
      window.history.replaceState({}, '', '/dashboard/integrations');
    }
  }, []);

  const loadStatus = async () => {
    try {
      const response = await api.get<LinkStatus>('/api/oauth/status');
      setStatus(response.data);
    } catch (err) {
      console.error('Erro ao carregar status:', err);
      setError('Não foi possível carregar o status das integrações');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthCallback = async (provider: string, code: string, state: string | null) => {
    try {
      if (provider === 'discord') {
        setLinkingDiscord(true);
        await api.post('/api/oauth/discord/callback', { code, state });
        setSuccess('Discord vinculado com sucesso!');
      } else if (provider === 'roblox') {
        setLinkingRoblox(true);
        const codeVerifier = localStorage.getItem('roblox_code_verifier');
        await api.post('/api/oauth/roblox/callback', { code, codeVerifier, state });
        localStorage.removeItem('roblox_code_verifier');
        setSuccess('Roblox vinculado com sucesso!');
      }
      await loadStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao processar vinculação');
    } finally {
      setLinkingDiscord(false);
      setLinkingRoblox(false);
    }
  };

  const linkDiscord = async () => {
    try {
      setLinkingDiscord(true);
      setError(null);
      const response = await api.get<{ url: string }>('/api/oauth/discord/url');
      window.location.href = response.data.url;
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao iniciar vinculação Discord');
      setLinkingDiscord(false);
    }
  };

  const linkRoblox = async () => {
    try {
      setLinkingRoblox(true);
      setError(null);
      const response = await api.get<{ url: string; codeVerifier: string }>('/api/oauth/roblox/url');
      localStorage.setItem('roblox_code_verifier', response.data.codeVerifier);
      window.location.href = response.data.url;
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao iniciar vinculação Roblox');
      setLinkingRoblox(false);
    }
  };

  const unlinkAccount = async (provider: 'discord' | 'roblox') => {
    try {
      setUnlinking(provider);
      setError(null);
      await api.delete(`/api/oauth/${provider}`);
      setSuccess(`${provider === 'discord' ? 'Discord' : 'Roblox'} desvinculado com sucesso!`);
      await loadStatus();
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Erro ao desvincular conta');
    } finally {
      setUnlinking(null);
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              Vincule sua conta Discord para receber notificações de pedidos
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
                  onClick={() => unlinkAccount('discord')}
                  disabled={unlinking === 'discord'}
                >
                  {unlinking === 'discord' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Unlink className="h-4 w-4 mr-2" />
                  )}
                  Desvincular
                </Button>
              </div>
            ) : (
              <Button
                className="w-full bg-[#5865F2] hover:bg-[#4752C4]"
                onClick={linkDiscord}
                disabled={linkingDiscord}
              >
                {linkingDiscord ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Vincular Discord
              </Button>
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
              Vincule sua conta Roblox para entregar gamepasses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status?.roblox.linked ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">{status.roblox.username}</p>
                    <p className="text-sm text-zinc-500">ID: {status.roblox.id}</p>
                    <p className="text-sm font-medium text-emerald-400">
                      Saldo: {status.roblox.balance.toLocaleString()} Robux
                    </p>
                  </div>
                </div>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => unlinkAccount('roblox')}
                  disabled={unlinking === 'roblox'}
                >
                  {unlinking === 'roblox' ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Unlink className="h-4 w-4 mr-2" />
                  )}
                  Desvincular
                </Button>
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        {/* Mercado Pago */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-white">
                <svg className="h-6 w-6 text-[#00B1EA]" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2zm-1 5v2H9v2h2v6h2v-6h2v-2h-2V7h-2z"/>
                </svg>
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
              Configure sua conta Mercado Pago para receber pagamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            {status?.mercadoPago.configured ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-3 bg-zinc-800 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">Token configurado</p>
                    {status.mercadoPago.sandbox && (
                      <Badge variant="outline" className="mt-1 border-yellow-500/30 text-yellow-400">Modo Sandbox</Badge>
                    )}
                  </div>
                </div>
                <Button variant="outline" className="w-full border-zinc-700 text-zinc-300 hover:bg-zinc-800" asChild>
                  <a href="/dashboard/payment-settings">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Configurações de Pagamento
                  </a>
                </Button>
              </div>
            ) : (
              <Button className="w-full bg-[#00B1EA] hover:bg-[#009ACC]" asChild>
                <a href="/dashboard/payment-settings">
                  <Link2 className="h-4 w-4 mr-2" />
                  Configurar Mercado Pago
                </a>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Informações */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Por que vincular suas contas?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3 text-zinc-400">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Discord:</strong> Receba notificações de novos pedidos e seja mencionado quando um pedido for atribuído a você.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Roblox:</strong> Seu saldo de Robux será verificado automaticamente para garantir que você pode entregar os pedidos.</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Mercado Pago:</strong> Receba pagamentos diretamente na sua conta quando um cliente pagar.</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
