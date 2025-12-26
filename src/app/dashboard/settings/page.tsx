"use client";

import { useState, useContext, useEffect } from "react";
import { UserContext } from "@/lib/user-context";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Lock, Save, Eye, EyeOff } from "lucide-react";

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

  const handleUpdateProfile = async () => {
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      await api.updateUser(parseInt(user.id), {
        name: name.trim() || undefined,
        username: username.trim() || undefined,
      });
      setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao atualizar perfil' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'As senhas não coincidem' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'A nova senha deve ter pelo menos 6 caracteres' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await api.changePassword(parseInt(user.id), {
        currentPassword: currentPassword || undefined,
        newPassword,
      });
      setMessage({ type: 'success', text: 'Senha alterada com sucesso!' });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Erro ao alterar senha' });
    } finally {
      setLoading(false);
    }
  };

  const getRoleName = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'gerente': return 'Gerente';
      case 'auxiliar': return 'Auxiliar';
      default: return role;
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Minha Conta</h1>
        <p className="text-zinc-400 mt-1">Gerencie suas informações pessoais e senha</p>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
          {message.text}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <User className="w-5 h-5" />
              Informações do Perfil
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Atualize seu nome e usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Nome</Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Usuário</Label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="seu.usuario"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Cargo</Label>
              <Input
                type="text"
                value={getRoleName(user.role)}
                disabled
                className="bg-zinc-800/50 border-zinc-700 text-zinc-400"
              />
              <p className="text-xs text-zinc-500">O cargo só pode ser alterado por um administrador</p>
            </div>
            <Button
              onClick={handleUpdateProfile}
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Salvar Alterações
            </Button>
          </CardContent>
        </Card>

        {/* Password Card */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100 flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Alterar Senha
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Atualize sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Senha Atual</Label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Nova Senha</Label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-zinc-800 border-zinc-700 text-zinc-100 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Confirmar Nova Senha</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={loading || !newPassword || !confirmPassword}
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Lock className="w-4 h-4 mr-2" />
              )}
              Alterar Senha
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
