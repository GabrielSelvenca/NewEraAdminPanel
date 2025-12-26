"use client";

import { useEffect, useState } from "react";
import { api, Partner } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Users, Loader2, Percent, CheckCircle2, XCircle, Edit2, Trash2
} from "lucide-react";
import { useContext } from "react";
import { UserContext } from "@/lib/user-context";

export default function PartnersPage() {
  const user = useContext(UserContext);
  const isSuperAdmin = user?.role === "admin";
  
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: "", pixKey: "", percentage: 25 });


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const partnersData = await api.getPartners().catch(() => []);
      setPartners(partnersData);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar dados");
    } finally {
      setLoading(false);
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
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Parceiros PIX</h1>
        <p className="text-zinc-400 mt-1">Gerencie parceiros para divisão manual de pagamentos</p>
      </div>

      {/* Parceiros PIX manuais */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-500" />
            Parceiros PIX
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
    </div>
  );
}
