'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Save, CheckCircle, XCircle, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { toast } from '@/lib/error-handling';

interface SellerPaymentSettings {
  id: number;
  name: string;
  email: string;
  phone?: string;
  cpfCnpj?: string;
  hasMercadoPagoAccessToken: boolean;
  mercadoPagoSandbox: boolean;
}

export default function PaymentSettingsPage() {
  const [seller, setSeller] = useState<SellerPaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const [formData, setFormData] = useState({
    cpfCnpj: '',
    mercadoPagoAccessToken: ''
  });

  useEffect(() => {
    loadCurrentSeller();
  }, []);

  const loadCurrentSeller = async () => {
    try {
      setLoading(true);
      // Pega o usuário atual (que já é seller se for admin/superadmin)
      const currentUser = await api.getCurrentUser();
      
      // Usa os dados do próprio usuário
      setSeller({
        id: parseInt(currentUser.id),
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        cpfCnpj: currentUser.cpfCnpj,
        hasMercadoPagoAccessToken: currentUser.hasMercadoPagoAccessToken || false,
        mercadoPagoSandbox: currentUser.mercadoPagoSandbox || false
      });
      
      setFormData({
        cpfCnpj: currentUser.cpfCnpj || '',
        mercadoPagoAccessToken: ''
      });
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!seller) return;

    if (!formData.cpfCnpj) {
      toast.error('Validação', 'CPF/CNPJ é obrigatório');
      return;
    }

    try {
      setSaving(true);
      
      const updateData: Record<string, string | boolean> = {
        cpfCnpj: formData.cpfCnpj.replace(/\D/g, ''),
        mercadoPagoSandbox: false
      };

      if (formData.mercadoPagoAccessToken) {
        updateData.mercadoPagoAccessToken = formData.mercadoPagoAccessToken;
      }

      await api.updateUser(seller.id, updateData);
      
      toast.success('Configurações salvas com sucesso!');
      await loadCurrentSeller();
      setFormData({ cpfCnpj: formData.cpfCnpj, mercadoPagoAccessToken: '' });
    } catch (error) {
      toast.error('Erro ao salvar', error instanceof Error ? error.message : undefined);
    } finally {
      setSaving(false);
    }
  };

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
          <p className="text-lg font-medium">Vendedor não encontrado</p>
          <p className="text-sm text-muted-foreground mt-2">
            Você precisa estar cadastrado como vendedor para acessar esta página
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configurações de Pagamento</h1>
        <p className="text-muted-foreground mt-1">
          Configure seus dados para receber pagamentos e gerenciar cobranças
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Vendedor</CardTitle>
            <CardDescription>Seus dados cadastrados no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Nome</Label>
              <p className="font-medium">{seller.name}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Email</Label>
              <p className="font-medium">{seller.email}</p>
            </div>
            {seller.phone && (
              <div>
                <Label className="text-xs text-muted-foreground">Telefone</Label>
                <p className="font-medium">{seller.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status da Conta Mercado Pago</CardTitle>
            <CardDescription>Configuração da integração de pagamentos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm">Access Token Configurado</Label>
              {seller.hasMercadoPagoAccessToken ? (
                <Badge variant="default" className="gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Configurada
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1">
                  <XCircle className="w-3 h-3" />
                  Não configurada
                </Badge>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm">Ambiente</Label>
              <Badge variant="default" className="bg-green-600 hover:bg-green-700">
                🚀 Produção
              </Badge>
            </div>

            {seller.cpfCnpj && (
              <div>
                <Label className="text-xs text-muted-foreground">CPF/CNPJ Cadastrado</Label>
                <p className="font-medium font-mono">{formatCpfCnpj(seller.cpfCnpj)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Configurar Dados de Cobrança
          </CardTitle>
          <CardDescription>
            Configure seu CPF/CNPJ e Access Token do Mercado Pago para receber pagamentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
                <Input
                  id="cpfCnpj"
                  value={formData.cpfCnpj}
                  onChange={(e) => {
                    const formatted = formatCpfCnpj(e.target.value);
                    setFormData({ ...formData, cpfCnpj: formatted });
                  }}
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Usado para identificação nas cobranças
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mercadoPagoAccessToken">Access Token do Mercado Pago</Label>
                <div className="flex gap-2">
                  <Input
                    id="mercadoPagoAccessToken"
                    type={showApiKey ? 'text' : 'password'}
                    value={formData.mercadoPagoAccessToken}
                    onChange={(e) => setFormData({ ...formData, mercadoPagoAccessToken: e.target.value })}
                    placeholder={seller.hasMercadoPagoAccessToken ? '••••••••••••••••' : 'Cole seu Access Token aqui'}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {seller.hasMercadoPagoAccessToken 
                    ? 'Deixe em branco para manter o token atual' 
                    : 'Obtenha em mercadopago.com.br → Seu negócio → Credenciais'}
                </p>
              </div>
            </div>

            <div className="pt-2 pb-1">
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Ambiente de Produção Ativo
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Todas as transações serão reais e processarão dinheiro real.
                  </p>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">ℹ️ Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>• <strong>CPF/CNPJ:</strong> Usado para identificar você nas cobranças e transferências do Mercado Pago</p>
          <p>• <strong>Access Token:</strong> Permite que o sistema crie cobranças em sua conta Mercado Pago</p>
          <p>• <strong>Produção:</strong> Todas as transações processam dinheiro real</p>
          <p>• <strong>Segurança:</strong> Seu Access Token é criptografado e nunca é exibido após salvar</p>
        </CardContent>
      </Card>
    </div>
  );
}
