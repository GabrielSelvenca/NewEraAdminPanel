'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users } from 'lucide-react';
import { api, type AsaasCustomer } from '@/lib/api';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<AsaasCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cpfCnpj: '',
    email: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const response = await api.getAsaasCustomers();
      setCustomers(response.data || []);
    } catch (error) {
      console.error('Erro ao carregar customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.cpfCnpj) {
      alert('Preencha nome e CPF/CNPJ');
      return;
    }

    try {
      setSaving(true);
      await api.createAsaasCustomer(formData);

      setFormData({ name: '', cpfCnpj: '', email: '' });
      setShowForm(false);
      await loadCustomers();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar customer';
      alert(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const formatCpfCnpj = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      // CPF: 000.000.000-00
      return numbers
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    } else {
      // CNPJ: 00.000.000/0000-00
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers Asaas</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie os customers usados para criar cobranças PIX
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Customer
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Criar Novo Customer</CardTitle>
            <CardDescription>
              Preencha os dados para criar um customer no Asaas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nome do cliente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cpfCnpj">CPF/CNPJ *</Label>
                  <Input
                    id="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={(e) => {
                      const formatted = formatCpfCnpj(e.target.value);
                      setFormData({ ...formData, cpfCnpj: formatted });
                    }}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving}>
                  {saving ? 'Criando...' : 'Criar Customer'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setFormData({ name: '', cpfCnpj: '', email: '' });
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customers Cadastrados
          </CardTitle>
          <CardDescription>
            {customers.length} customer(s) disponível(is) para cobranças
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando...
            </div>
          ) : customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p>Nenhum customer cadastrado</p>
              <p className="text-sm mt-2">Crie um customer para começar a gerar cobranças PIX</p>
            </div>
          ) : (
            <div className="space-y-2">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-muted-foreground">
                      CPF/CNPJ: {customer.cpfCnpj}
                      {customer.email && ` • ${customer.email}`}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      ID: {customer.id}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">ℹ️ Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>• <strong>Customers</strong> são necessários para criar cobranças PIX no Asaas</p>
          <p>• O sistema escolhe automaticamente um customer disponível ao gerar o PIX</p>
          <p>• Você pode criar quantos customers quiser</p>
          <p>• Use CPF/CNPJ válidos ou genéricos (ex: 000.000.000-00)</p>
        </CardContent>
      </Card>
    </div>
  );
}
