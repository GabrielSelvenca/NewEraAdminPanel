'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, ShoppingCart, Key, Edit, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';

interface Seller {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  hasAsaasApiKey: boolean;
  asaasSandbox: boolean;
  maxActiveOrders: number;
  cooldownSeconds: number;
  robuxBalance: number;
  robloxUsername?: string;
  activeOrders: number;
  totalOrdersCompleted: number;
  createdAt: string;
}

export default function SellersPage() {
  const [sellers, setSellers] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    asaasApiKey: '',
    asaasSandbox: false,
    maxActiveOrders: 5,
    cooldownSeconds: 30
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSellers();
  }, []);

  const loadSellers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/sellers', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setSellers(data);
      }
    } catch (error) {
      console.error('Erro ao carregar sellers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email) {
      alert('Preencha nome e email');
      return;
    }

    try {
      setSaving(true);
      const url = editingSeller ? `/api/sellers/${editingSeller.id}` : '/api/sellers';
      const method = editingSeller ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({
          name: '',
          email: '',
          phone: '',
          asaasApiKey: '',
          asaasSandbox: false,
          maxActiveOrders: 5,
          cooldownSeconds: 30
        });
        setShowForm(false);
        setEditingSeller(null);
        await loadSellers();
      } else {
        const error = await response.text();
        alert(error || 'Erro ao salvar seller');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao salvar seller';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (seller: Seller) => {
    setEditingSeller(seller);
    setFormData({
      name: seller.name,
      email: seller.email,
      phone: seller.phone || '',
      asaasApiKey: '', // Não preenche a API Key por segurança
      asaasSandbox: seller.asaasSandbox,
      maxActiveOrders: seller.maxActiveOrders,
      cooldownSeconds: seller.cooldownSeconds
    });
    setShowForm(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive'; label: string }> = {
      ACTIVE: { variant: 'default', label: 'Ativo' },
      PAUSED: { variant: 'secondary', label: 'Pausado' },
      BANNED: { variant: 'destructive', label: 'Banido' }
    };
    const config = variants[status] || variants.ACTIVE;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Vendedores</h1>
          <p className="text-zinc-400 mt-1">Gerencie vendedores e suas API Keys do Asaas</p>
        </div>
        <Button onClick={() => { setShowForm(true); setEditingSeller(null); }} className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Vendedor
        </Button>
      </div>

      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">
              {editingSeller ? 'Editar Vendedor' : 'Criar Novo Vendedor'}
            </CardTitle>
            <CardDescription>
              {editingSeller 
                ? 'Atualize os dados do vendedor e sua API Key do Asaas'
                : 'Preencha os dados para criar um novo vendedor com sua API Key do Asaas'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-zinc-200">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="Nome do vendedor"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-zinc-200">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                    placeholder="email@exemplo.com"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-zinc-200">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  placeholder="(00) 00000-0000"
                />
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Key className="w-5 h-5 text-blue-400" />
                  <h3 className="text-lg font-semibold text-zinc-100">Configuração Asaas</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="asaasApiKey" className="text-zinc-200 flex items-center gap-2">
                      API Key do Asaas *
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="h-6 w-6 p-0"
                      >
                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </Label>
                    <Input
                      id="asaasApiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={formData.asaasApiKey}
                      onChange={(e) => setFormData({ ...formData, asaasApiKey: e.target.value })}
                      className="bg-zinc-800 border-zinc-700 text-zinc-100 font-mono"
                      placeholder="$aact_..."
                      required={!editingSeller}
                    />
                    <p className="text-xs text-zinc-500 mt-1">
                      {editingSeller 
                        ? 'Deixe em branco para manter a API Key atual'
                        : 'Cada vendedor precisa de sua própria API Key do Asaas'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="asaasSandbox"
                      checked={formData.asaasSandbox}
                      onChange={(e) => setFormData({ ...formData, asaasSandbox: e.target.checked })}
                      className="rounded border-zinc-700"
                    />
                    <Label htmlFor="asaasSandbox" className="text-zinc-200 cursor-pointer">
                      Usar ambiente Sandbox (testes)
                    </Label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-zinc-800 pt-4">
                <div>
                  <Label htmlFor="maxActiveOrders" className="text-zinc-200">Pedidos Simultâneos</Label>
                  <Input
                    id="maxActiveOrders"
                    type="number"
                    min="1"
                    max="20"
                    value={formData.maxActiveOrders}
                    onChange={(e) => setFormData({ ...formData, maxActiveOrders: parseInt(e.target.value) })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div>
                  <Label htmlFor="cooldownSeconds" className="text-zinc-200">Cooldown (segundos)</Label>
                  <Input
                    id="cooldownSeconds"
                    type="number"
                    min="0"
                    max="300"
                    value={formData.cooldownSeconds}
                    onChange={(e) => setFormData({ ...formData, cooldownSeconds: parseInt(e.target.value) })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={saving} className="bg-green-600 hover:bg-green-700">
                  {saving ? 'Salvando...' : editingSeller ? 'Atualizar' : 'Criar Vendedor'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setShowForm(false); setEditingSeller(null); }}
                  className="border-zinc-700"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-zinc-400" />
            <CardTitle className="text-zinc-100">Vendedores Cadastrados</CardTitle>
          </div>
          <CardDescription>
            {sellers.length} vendedor(es) disponível(is) para processar pedidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-zinc-400 text-center py-8">Carregando vendedores...</p>
          ) : sellers.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
              <p className="text-zinc-400 text-lg mb-2">Nenhum vendedor cadastrado</p>
              <p className="text-zinc-500 text-sm">
                Clique em Novo Vendedor para adicionar o primeiro vendedor
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {sellers.map((seller) => (
                <div
                  key={seller.id}
                  className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:border-zinc-600 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-zinc-100">{seller.name}</h3>
                        {getStatusBadge(seller.status)}
                        {seller.hasAsaasApiKey ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            API Key Configurada
                          </Badge>
                        ) : (
                          <Badge variant="destructive">
                            <XCircle className="w-3 h-3 mr-1" />
                            Sem API Key
                          </Badge>
                        )}
                        {seller.asaasSandbox && (
                          <Badge variant="secondary">Sandbox</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-zinc-500">Email</p>
                          <p className="text-zinc-300">{seller.email}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Pedidos Ativos</p>
                          <p className="text-zinc-300">{seller.activeOrders} / {seller.maxActiveOrders}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Robux Disponível</p>
                          <p className="text-zinc-300">{seller.robuxBalance.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-zinc-500">Total Completado</p>
                          <p className="text-zinc-300">{seller.totalOrdersCompleted} pedidos</p>
                        </div>
                      </div>

                      {seller.robloxUsername && (
                        <div className="mt-2">
                          <p className="text-xs text-zinc-500">
                            Roblox: <span className="text-zinc-400">{seller.robloxUsername}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(seller)}
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
