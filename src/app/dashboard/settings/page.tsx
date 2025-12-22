"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Key, Eye, EyeOff } from "lucide-react";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);

  // Asaas Config
  const [asaasApiKey, setAsaasApiKey] = useState("");
  const [asaasWalletId, setAsaasWalletId] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const configData = await api.getConfig();
      
      // Carregar configs Asaas se existirem
      setAsaasApiKey(configData.asaasApiKey || "");
      setAsaasWalletId(configData.asaasWalletId || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      await api.updateConfig({
        asaasApiKey: asaasApiKey || undefined,
        asaasWalletId: asaasWalletId || undefined,
      });

      setMessage("Configurações salvas com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Configurações do Sistema</h1>
        <p className="text-zinc-400 mt-1">Configure as integrações e API keys</p>
      </div>

      {/* Asaas Integration */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-emerald-500" />
            Integração Asaas
          </CardTitle>
          <CardDescription>
            Configure suas credenciais da API Asaas para processar pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asaasApiKey">API Key Asaas *</Label>
            <div className="relative">
              <Input
                id="asaasApiKey"
                type={showApiKey ? "text" : "password"}
                value={asaasApiKey}
                onChange={(e) => setAsaasApiKey(e.target.value)}
                className="bg-zinc-800 border-zinc-700 pr-10"
                placeholder="$aact_..."
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="h-4 w-4 text-zinc-400" />
                ) : (
                  <Eye className="h-4 w-4 text-zinc-400" />
                )}
              </Button>
            </div>
            <p className="text-xs text-zinc-500">
              Encontre sua API Key no painel da Asaas em Configurações → Integrações
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asaasWalletId">Wallet ID (Opcional)</Label>
            <Input
              id="asaasWalletId"
              value={asaasWalletId}
              onChange={(e) => setAsaasWalletId(e.target.value)}
              className="bg-zinc-800 border-zinc-700"
              placeholder="wallet_..."
            />
            <p className="text-xs text-zinc-500">
              ID da carteira Asaas para receber os pagamentos (deixe vazio para usar a conta principal)
            </p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
            <p className="text-sm text-yellow-200">
              ⚠️ <strong>Importante:</strong> Mantenha sua API Key segura. Ela será usada pelo bot para processar todos os pagamentos.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex items-center gap-4">
        <Button
          onClick={handleSave}
          disabled={saving || !asaasApiKey}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar Configurações
            </>
          )}
        </Button>

        {message && (
          <p className={`text-sm ${message.includes("sucesso") ? "text-emerald-400" : "text-red-400"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
