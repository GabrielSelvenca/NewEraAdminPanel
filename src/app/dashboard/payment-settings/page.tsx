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
              <Badge variant="default">Produção</Badge>
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


            <Button type="submit" disabled={saving} className="w-full md:w-auto">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvando...' : 'Salvar Configurações'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>📘 Como Obter seu Access Token do Mercado Pago</CardTitle>
          <CardDescription>Siga o passo a passo abaixo para configurar sua integração</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Acesse o Mercado Pago</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Entre na sua conta em <a href="https://www.mercadopago.com.br" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">mercadopago.com.br</a>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Vá para Credenciais</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Clique no seu perfil (canto superior direito) → <strong>Seu negócio</strong> → <strong>Configurações</strong> → <strong>Credenciais</strong>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                3
              </div>
              <div className="flex-1">
                <h4 className="font-semibbold mb-1">Copie o Access Token de Produção</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Na seção &quot;Credenciais de produção&quot;, clique em <strong>&quot;Access Token de produção&quot;</strong> e copie o código que começa com <code className="bg-muted px-1 py-0.5 rounded text-xs">APP_USR-...</code>
                </p>
                <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-800 dark:text-yellow-200">
                    ⚠️ <strong>Importante:</strong> Use apenas o Access Token de <strong>PRODUÇÃO</strong>, não o de teste.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                4
              </div>
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Cole no Formulário Acima</h4>
                <p className="text-sm text-muted-foreground">
                  Cole o Access Token copiado no campo &quot;Access Token do Mercado Pago&quot; acima, preencha seu CPF/CNPJ e clique em <strong>Salvar Configurações</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t space-y-2">
            <h4 className="font-semibold text-sm">ℹ️ Informações Importantes</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Seu Access Token permite que o sistema crie cobranças em sua conta</li>
              <li>• O token é criptografado e armazenado com segurança</li>
              <li>• Você receberá os pagamentos diretamente na sua conta Mercado Pago</li>
              <li>• Nunca compartilhe seu Access Token com terceiros</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
