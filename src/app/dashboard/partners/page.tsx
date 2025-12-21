"use client";

import { useEffect, useState } from "react";
import { api, Partner, AsaasSubaccount } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users, Plus, Loader2, Wallet, Percent, CheckCircle2, XCircle,
  Building2, Mail, Phone, MapPin, Calendar, Edit2, Trash2
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/lib/user-context";

export default function PartnersPage() {
  const user = useContext(UserContext);
  const isSuperAdmin = user?.role === "admin";
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [subaccounts, setSubaccounts] = useState<AsaasSubaccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: "", pixKey: "", percentage: 25 });

  // Modal de criar subconta
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    cpfCnpj: "",
    email: "",
    phone: "",
    birthDate: "",
    address: "",
    addressNumber: "",
    province: "",
    postalCode: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [partnersData, subaccountsData] = await Promise.all([
        api.getPartners().catch(() => []),
        api.getAsaasSubaccounts().catch(() => []),
      ]);
      setPartners(partnersData);
      setSubaccounts(subaccountsData);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubaccount = async () => {
    if (!formData.name || !formData.cpfCnpj || !formData.email) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      setCreating(true);
      setError("");
      await api.createAsaasSubaccount(formData);
      setCreateDialogOpen(false);
      setFormData({
        name: "", cpfCnpj: "", email: "", phone: "",
        birthDate: "", address: "", addressNumber: "", province: "", postalCode: "",
      });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar subconta");
    } finally {
      setCreating(false);
    }
  };

  const handleUpdatePartner = async (id: number, data: Partial<Partner>) => {
    try {
      await api.updatePartner(id, data);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditPartner = (partner: Partner) => {
    setEditingPartner(partner);
    setPartnerForm({ name: partner.name, pixKey: partner.pixKey, percentage: partner.percentage });
    setEditDialogOpen(true);
  };

  const handleSavePartner = async () => {
    if (!editingPartner) return;
    try {
      await api.updatePartner(editingPartner.id, partnerForm);
      setEditDialogOpen(false);
      setEditingPartner(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    }
  };

  const handleDeletePartner = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir este parceiro?")) return;
    try {
      await api.deletePartner(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sem permissão para excluir");
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
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Parceiros & Split PIX</h1>
          <p className="text-zinc-400 mt-1">Configure a divisão automática de pagamentos</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Subconta Asaas
        </Button>
      </div>

      {/* Subcontas Asaas */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-500" />
            Subcontas Asaas (Split Automático)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subaccounts.length === 0 ? (
            <div className="text-center py-8 text-zinc-500">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma subconta cadastrada</p>
              <p className="text-sm mt-1">Crie subcontas para ativar o Split PIX automático</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {subaccounts.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 bg-zinc-800 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">{sub.name}</p>
                      <p className="text-sm text-zinc-500">{sub.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-zinc-400">Wallet ID</p>
                    <p className="text-xs text-zinc-500 font-mono">{sub.walletId}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Parceiros locais */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-500" />
            Parceiros (Divisão Manual)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {partners.length === 0 ? (
            <p className="text-zinc-500 text-center py-4">Nenhum parceiro cadastrado</p>
          ) : (
            <div className="grid gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="p-4 bg-zinc-800 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      partner.active ? 'bg-emerald-500/20' : 'bg-zinc-700'
                    }`}>
                      {partner.active ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">{partner.name}</p>
                      <p className="text-sm text-zinc-500">{partner.pixKey}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-zinc-400">
                        <Percent className="w-4 h-4" />
                        <span>{partner.percentage}%</span>
                      </div>
                      <p className="text-xs text-zinc-500">
                        Total: R$ {partner.totalReceived.toFixed(2)}
                      </p>
                    </div>
                    <Switch
                      checked={partner.active}
                      onCheckedChange={(checked) => handleUpdatePartner(partner.id, { active: checked })}
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditPartner(partner)}
                      className="text-zinc-400 hover:text-zinc-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    {isSuperAdmin && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeletePartner(partner.id)}
                        className="text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog editar parceiro */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Editar Parceiro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label className="text-zinc-300">Nome</Label>
              <Input
                value={partnerForm.name}
                onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Chave PIX</Label>
              <Input
                value={partnerForm.pixKey}
                onChange={(e) => setPartnerForm({ ...partnerForm, pixKey: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
              />
            </div>
            <div>
              <Label className="text-zinc-300">Porcentagem (%)</Label>
              <Input
                type="number"
                value={partnerForm.percentage}
                onChange={(e) => setPartnerForm({ ...partnerForm, percentage: parseFloat(e.target.value) || 0 })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button onClick={handleSavePartner} className="w-full bg-emerald-600 hover:bg-emerald-700">
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog criar subconta */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-zinc-100">Criar Subconta Asaas</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Crie uma subconta para receber pagamentos automaticamente via Split PIX
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Nome Completo *
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  placeholder="João Silva"
                />
              </div>
              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> CPF/CNPJ *
                </Label>
                <Input
                  value={formData.cpfCnpj}
                  onChange={(e) => setFormData({ ...formData, cpfCnpj: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <Mail className="w-4 h-4" /> Email *
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Telefone
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Data Nascimento
                </Label>
                <Input
                  type="date"
                  value={formData.birthDate}
                  onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-zinc-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> CEP
                </Label>
                <Input
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  placeholder="00000-000"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label className="text-zinc-300">Endereço</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  placeholder="Rua Exemplo"
                />
              </div>
              <div>
                <Label className="text-zinc-300">Número</Label>
                <Input
                  value={formData.addressNumber}
                  onChange={(e) => setFormData({ ...formData, addressNumber: e.target.value })}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                  placeholder="123"
                />
              </div>
            </div>

            <div>
              <Label className="text-zinc-300">Bairro</Label>
              <Input
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 mt-1"
                placeholder="Centro"
              />
            </div>

            {error && <p className="text-red-400 text-sm">{error}</p>}

            <Button
              onClick={handleCreateSubaccount}
              disabled={creating || !formData.name || !formData.cpfCnpj || !formData.email}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Criar Subconta
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
