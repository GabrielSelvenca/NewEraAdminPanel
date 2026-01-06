"use client";

import { useEffect, useState } from "react";
import { api, Coupon } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, Trash2, Loader2, Ticket, Calendar, Hash, Percent, 
  DollarSign, X, CheckCircle, AlertCircle, Power, Sparkles
} from "lucide-react";
import { toast } from "@/lib/error-handling";
import { couponSchema } from "@/lib/validations";
import { DateTimePicker } from "@/components/ui/date-time-picker";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

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
    } catch {
      toast.error("Erro ao carregar cupons");
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

      toast.success("Cupom criado!");
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
    if (!confirm("Deletar este cupom?")) return;

    try {
      await api.deleteCoupon(id);
      toast.success("Cupom deletado!");
      await loadCoupons();
    } catch (err) {
      toast.error("Erro ao deletar cupom", err instanceof Error ? err.message : undefined);
    }
  };

  const toggleActive = async (id: number, active: boolean) => {
    try {
      await api.updateCoupon(id, { active: !active });
      toast.success(`Cupom ${!active ? 'ativado' : 'desativado'}!`);
      await loadCoupons();
    } catch (err) {
      toast.error("Erro ao atualizar cupom", err instanceof Error ? err.message : undefined);
    }
  };

  const formatExpiry = (dateStr?: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMs < 0) return { text: "Expirado", color: "text-red-400" };
    if (diffDays <= 1) return { text: "Expira hoje", color: "text-amber-400" };
    if (diffDays <= 7) return { text: `${diffDays} dias`, color: "text-amber-400" };
    return { text: date.toLocaleDateString('pt-BR'), color: "text-zinc-400" };
  };

  const stats = {
    active: coupons.filter(c => c.active && c.isValid).length,
    inactive: coupons.filter(c => !c.active || !c.isValid).length,
    total: coupons.length
  };

  return (
    <motion.div 
      className="space-y-5"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-6 h-6 text-pink-400" />
            Cupons
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Gerenciar cupons de desconto</p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)} 
          className={showForm ? "bg-zinc-700" : "bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"}
        >
          {showForm ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
          {showForm ? "Cancelar" : "Novo Cupom"}
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-zinc-500 uppercase">Ativos</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.active}</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-500 uppercase">Inativos</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.inactive}</p>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2">
            <Ticket className="w-4 h-4 text-pink-400" />
            <span className="text-xs text-zinc-500 uppercase">Total</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
        </div>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-5 border-pink-500/20">
              <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-pink-400" />
                Criar Novo Cupom
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Código</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="bg-zinc-800/50 border-zinc-700 font-mono"
                    placeholder="DESCONTO10"
                    maxLength={50}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Tipo</Label>
                  <Select 
                    value={formData.discountType} 
                    onValueChange={(value) => setFormData({ ...formData, discountType: value })}
                  >
                    <SelectTrigger className="bg-zinc-800/50 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="percentage">Percentual (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Valor</Label>
                  <div className="relative">
                    <Input
                      type="number"
                      value={formData.discountValue || ""}
                      onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                      className="bg-zinc-800/50 border-zinc-700 pr-10"
                      placeholder="10"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">
                      {formData.discountType === "percentage" ? "%" : "R$"}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Expiração (opcional)</Label>
                  <DateTimePicker
                    value={formData.expiresAt}
                    onChange={(value) => setFormData({ ...formData, expiresAt: value })}
                    placeholder="Selecionar data"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Limite de Usos</Label>
                  <Input
                    type="number"
                    value={formData.maxUses}
                    onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
                    className="bg-zinc-800/50 border-zinc-700"
                    placeholder="Ilimitado"
                  />
                </div>

                <div className="flex items-end">
                  <Button 
                    onClick={handleCreate} 
                    disabled={creating || !formData.code.trim()} 
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:opacity-90"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                    Criar Cupom
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Coupons Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-pink-400" />
        </div>
      ) : coupons.length === 0 ? (
        <motion.div variants={item} className="glass-card py-16 text-center">
          <Ticket className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
          <p className="text-zinc-500">Nenhum cupom cadastrado</p>
          <Button 
            onClick={() => setShowForm(true)} 
            variant="ghost" 
            className="mt-3 text-pink-400 hover:text-pink-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Criar primeiro cupom
          </Button>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map((coupon) => {
            const expiry = formatExpiry(coupon.expiresAt);
            const isValid = coupon.active && coupon.isValid;
            
            return (
              <motion.div
                key={coupon.id}
                variants={item}
                className={`glass-card overflow-hidden transition-all ${!isValid ? "opacity-60" : ""}`}
              >
                <div className={`h-1 ${isValid ? "bg-gradient-to-r from-pink-500 to-purple-500" : "bg-zinc-700"}`} />
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <code className="text-lg font-bold text-white font-mono">{coupon.code}</code>
                      <div className="flex items-center gap-2 mt-1">
                        {coupon.discountType === "percentage" ? (
                          <span className="flex items-center gap-1 text-sm text-pink-400">
                            <Percent className="w-3 h-3" />
                            {coupon.discountValue}%
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-sm text-emerald-400">
                            <DollarSign className="w-3 h-3" />
                            R$ {coupon.discountValue.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleActive(coupon.id, coupon.active)}
                        className={`h-8 w-8 ${coupon.active ? "text-emerald-400 hover:bg-emerald-500/10" : "text-zinc-500 hover:bg-zinc-700"}`}
                        title={coupon.active ? "Desativar" : "Ativar"}
                      >
                        <Power className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(coupon.id)}
                        className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                        title="Deletar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between text-zinc-500">
                      <span className="flex items-center gap-1">
                        <Hash className="w-3 h-3" />
                        Usos
                      </span>
                      <span className="text-zinc-300">
                        {coupon.currentUses}{coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                      </span>
                    </div>
                    
                    {expiry && (
                      <div className="flex items-center justify-between text-zinc-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expira
                        </span>
                        <span className={expiry.color}>{expiry.text}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Status badges */}
                  <div className="flex gap-1 mt-3">
                    {isValid ? (
                      <span className="px-2 py-0.5 text-xs rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Ativo
                      </span>
                    ) : (
                      <>
                        {coupon.isExpired && (
                          <span className="px-2 py-0.5 text-xs rounded bg-red-500/10 text-red-400 border border-red-500/20">
                            Expirado
                          </span>
                        )}
                        {coupon.isMaxUsesReached && (
                          <span className="px-2 py-0.5 text-xs rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Limite
                          </span>
                        )}
                        {!coupon.active && !coupon.isExpired && !coupon.isMaxUsesReached && (
                          <span className="px-2 py-0.5 text-xs rounded bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                            Desativado
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
