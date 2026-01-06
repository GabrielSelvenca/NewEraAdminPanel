"use client";

import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/lib/user-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { 
  Loader2, User, Lock, Save, Eye, EyeOff, CheckCircle, 
  AlertCircle, Shield, Crown, Sparkles
} from "lucide-react";

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: "Administrador", color: "text-red-400 bg-red-500/10", icon: Crown },
  gerente: { label: "Gerente", color: "text-purple-400 bg-purple-500/10", icon: Shield },
  auxiliar: { label: "Auxiliar", color: "text-blue-400 bg-blue-500/10", icon: User },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function SettingsPage() {
  const user = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Profile form
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");

  // Password form
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername(user.username || "");
    }
  }, [user]);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      await api.updateUser(parseInt(user.id), {
        name: name.trim() || undefined,
        username: username.trim() || undefined,
      });
      setMessage({ type: 'success', text: 'Perfil atualizado!' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao atualizar' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Senhas não coincidem' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mínimo 6 caracteres' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.changePassword(parseInt(user.id), {
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      setMessage({ type: 'success', text: 'Senha alterada!' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao alterar' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  const roleInfo = roleConfig[user.role] || roleConfig.auxiliar;
  const RoleIcon = roleInfo.icon;

  return (
    <motion.div 
      className="space-y-6 max-w-3xl"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-cyan-400" />
          Minha Conta
        </h1>
        <p className="text-zinc-500 text-sm mt-0.5">Gerencie suas informações pessoais</p>
      </motion.div>

      {/* Toast */}
      {message && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-3 rounded-lg flex items-center gap-2 text-sm ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border border-red-500/20'
          }`}
        >
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-cyan-500 to-emerald-500" />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {user.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{user.name}</h2>
              <p className="text-zinc-500">@{user.username}</p>
              <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${roleInfo.color}`}>
                <RoleIcon className="w-3 h-3" />
                {roleInfo.label}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase">Nome</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase">Usuário</Label>
                <Input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="seu.usuario"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
            </div>

            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Salvar Alterações
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Password Card */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500" />
        <div className="p-6">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
            <Lock className="w-4 h-4 text-amber-400" />
            Alterar Senha
          </h3>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase">Senha Atual</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-800/50 border-zinc-700 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase">Nova Senha</Label>
                <div className="relative">
                  <Input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-zinc-800/50 border-zinc-700 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase">Confirmar</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
            </div>

            <Button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Lock className="w-4 h-4 mr-2" />}
              Alterar Senha
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
