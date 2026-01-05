"use client";

import { useEffect, useState } from "react";
import { api, Coupon } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Loader2, Ticket, Calendar, Hash, Percent, DollarSign } from "lucide-react";
import { LoadingState } from "@/components/shared";
import { toast } from "@/lib/error-handling";
import { couponSchema } from "@/lib/validations";
import { DateTimePicker } from "@/components/ui/date-time-picker";

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: 0,
    expiresAt: "",
    maxUses: "",
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await api.getCoupons();
      setCoupons(data);
    } catch (err) {
      } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    const data = {
      code: formData.code,
      discountType: formData.discountType as "percentage" | "fixed",
      discountValue: formData.discountValue,
      expiresAt: formData.expiresAt || "",
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
      active: true,
    };

    const validated = couponSchema.safeParse(data);
    if (!validated.success) {
      toast.error("Validação", validated.error.issues[0]?.message || "Dados inválidos");
      return;
    }

    try {
      setCreating(true);
      await api.createCoupon({
        ...validated.data,
        expiresAt: validated.data.expiresAt || null,
      });

      toast.success("Cupom criado com sucesso");
      setFormData({
        code: "",
        discountType: "percentage",
        discountValue: 0,
        expiresAt: "",
        maxUses: "",
      });
      setShowForm(false);
      await loadCoupons();
    } catch (err) {
      toast.error("Erro ao criar cupom", err instanceof Error ? err.message : undefined);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Tem certeza que deseja deletar este cupom?")) return;

    try {
      await api.deleteCoupon(id);
      toast.success("Cupom deletado com sucesso");
      await loadCoupons();
    } catch (err) {
      toast.error("Erro ao deletar cupom", err instanceof Error ? err.message : undefined);
    }
  };

  const toggleActive = async (id: number, active: boolean) => {
    try {
      await api.updateCoupon(id, { active: !active });
      toast.success(`Cupom ${!active ? 'ativado' : 'desativado'} com sucesso`);
      await loadCoupons();
    } catch (err) {
      toast.error("Erro ao atualizar cupom", err instanceof Error ? err.message : undefined);
    }
  };

  if (loading) {
    return <LoadingState message="Carregando cupons..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Cupons</h1>
          <p className="text-zinc-400 mt-1">Gerencie cupons de desconto com limite de tempo e usos</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {showForm && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Criar Novo Cupom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Código do Cupom</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="bg-zinc-800 border-zinc-700"
                  placeholder="DESCONTO10"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label>Tipo de Desconto</Label>
                <Select value={formData.discountType} onValueChange={(value) => setFormData({ ...formData, discountType: value })}>
                  <SelectTrigger className="bg-zinc-800 border-zinc-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="percentage">Percentual (%)</SelectItem>
                    <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Valor do Desconto</Label>
                <div className="relative">
                  <Input
                    type="text"
                    inputMode="decimal"
                    value={formData.discountValue || ""}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9.,]/g, "").replace(",", ".");
                      setFormData({ ...formData, discountValue: parseFloat(val) || 0 });
                    }}
                    className="bg-zinc-800 border-zinc-700 pr-10 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder={formData.discountType === "percentage" ? "10" : "5.00"}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                    {formData.discountType === "percentage" ? "%" : "R$"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Data de Expiração (Opcional)</Label>
                <DateTimePicker
                  value={formData.expiresAt}
                  onChange={(value) => setFormData({ ...formData, expiresAt: value })}
                  placeholder="Selecionar data e hora"
                />
              </div>

              <div className="space-y-2">
                <Label>Limite de Usos (Opcional)</Label>
                <Input
                  type="text"
                  inputMode="numeric"
                  value={formData.maxUses}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^0-9]/g, "");
                    setFormData({ ...formData, maxUses: val });
                  }}
                  className="bg-zinc-800 border-zinc-700 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder="Deixe vazio para ilimitado"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                Criar Cupom
              </Button>
              <Button onClick={() => setShowForm(false)} variant="outline">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 col-span-full">
            <CardContent className="py-12 text-center text-zinc-500">
              <Ticket className="w-12 h-12 mx-auto mb-4 opacity-50" />
              Nenhum cupom cadastrado
            </CardContent>
          </Card>
        ) : (
          coupons.map((coupon) => (
            <Card
              key={coupon.id}
              className={`bg-zinc-900 border-zinc-800 ${!coupon.active ? "opacity-50" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-5 h-5 text-emerald-500" />
                    <CardTitle className="text-lg">{coupon.code}</CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={coupon.active ? "outline" : "default"}
                      onClick={() => toggleActive(coupon.id, coupon.active)}
                      className="h-7 px-2"
                    >
                      {coupon.active ? "Desativar" : "Ativar"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(coupon.id)}
                      className="h-7 px-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  {coupon.discountType === "percentage" ? (
                    <Percent className="w-4 h-4 text-blue-400" />
                  ) : (
                    <DollarSign className="w-4 h-4 text-green-400" />
                  )}
                  <span className="text-zinc-300">
                    {coupon.discountType === "percentage"
                      ? `${coupon.discountValue}% de desconto`
                      : `R$ ${coupon.discountValue.toFixed(2)} de desconto`}
                  </span>
                </div>

                {coupon.expiresAt && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <Calendar className="w-4 h-4" />
                    Expira: {new Date(coupon.expiresAt).toLocaleString("pt-BR")}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-zinc-400">
                  <Hash className="w-4 h-4" />
                  Usos: {coupon.currentUses}
                  {coupon.maxUses ? ` / ${coupon.maxUses}` : " (ilimitado)"}
                </div>

                <div className="pt-2 border-t border-zinc-800">
                  {coupon.isExpired && (
                    <span className="inline-block px-2 py-1 text-xs rounded bg-red-500/10 text-red-400 border border-red-500/20">
                      Expirado
                    </span>
                  )}
                  {coupon.isMaxUsesReached && (
                    <span className="inline-block px-2 py-1 text-xs rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 ml-2">
                      Limite Atingido
                    </span>
                  )}
                  {coupon.isValid && coupon.active && (
                    <span className="inline-block px-2 py-1 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Ativo
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
