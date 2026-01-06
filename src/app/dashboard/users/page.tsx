"use client";

import { useEffect, useState } from "react";
import { api, AdminUser } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Plus, RefreshCw, Users, Loader2, Trash2, Pencil, Key, 
  Search, Shield, UserCog, Crown, User, CheckCircle
} from "lucide-react";
import { toast } from "@/lib/error-handling";

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  admin: { label: "Admin", color: "bg-red-500/10 text-red-400 border-red-500/20", icon: Crown },
  gerente: { label: "Gerente", color: "bg-purple-500/10 text-purple-400 border-purple-500/20", icon: Shield },
  auxiliar: { label: "Auxiliar", color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: User },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 }
};

export default function UsersPage() {
  const currentUser = useUser();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("auxiliar");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [allowedRoles, setAllowedRoles] = useState<string[]>([]);
  
  // Edit user state
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  
  // Change password state
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState<number | null>(null);
  const [passwordUserName, setPasswordUserName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Search and filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setUsers(data);
    } catch {
      toast.error("Erro ao carregar usuários");
    } finally {
      setLoading(false);
    }
  };

  const loadAllowedRoles = async () => {
    try {
      const roles = await api.getAllowedRoles();
      if (roles.length === 0 && currentUser?.role === "admin") {
        setAllowedRoles(["admin", "gerente", "auxiliar"]);
        setRole("gerente");
      } else {
        setAllowedRoles(roles);
        if (roles.length > 0) setRole(roles[0]);
      }
    } catch {
      if (currentUser?.role === "admin") {
        setAllowedRoles(["admin", "gerente", "auxiliar"]);
        setRole("gerente");
      } else if (currentUser?.role === "gerente") {
        setAllowedRoles(["auxiliar"]);
        setRole("auxiliar");
      }
    }
  };

  useEffect(() => {
    loadUsers();
    loadAllowedRoles();
  }, []);

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Deletar "${username}"?`)) return;
    try {
      await api.deleteUser(id);
      toast.success("Usuário deletado!");
      await loadUsers();
    } catch (err) {
      toast.error("Erro ao deletar", err instanceof Error ? err.message : undefined);
    }
  };

  const openEditDialog = (user: AdminUser) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditUsername(user.username);
    setEditRole(user.role);
    setError("");
    setEditDialogOpen(true);
  };

  const handleEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    setError("");
    try {
      await api.updateUser(editingUser.id, {
        name: editName.trim() || undefined,
        username: editUsername.trim() || undefined,
        role: currentUser?.role === "admin" ? editRole : undefined,
      });
      toast.success("Usuário atualizado!");
      setEditDialogOpen(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const openPasswordDialog = (user: AdminUser) => {
    setPasswordUserId(user.id);
    setPasswordUserName(user.name);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError("");
    setPasswordDialogOpen(true);
  };

  const handleChangePassword = async () => {
    if (!passwordUserId) return;
    if (newPassword !== confirmPassword) {
      setError("Senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      setError("Mínimo 6 caracteres");
      return;
    }
    setChangingPassword(true);
    setError("");
    try {
      const isSelf = passwordUserId === Number(currentUser?.id);
      await api.changePassword(passwordUserId, {
        currentPassword: isSelf ? currentPassword : undefined,
        newPassword,
      });
      toast.success("Senha alterada!");
      setPasswordDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar");
    } finally {
      setChangingPassword(false);
    }
  };

  const handleCreate = async () => {
    if (!username.trim() || !name.trim() || !password.trim()) return;
    setCreating(true);
    setError("");
    try {
      await api.createUser({ username: username.trim(), name: name.trim(), password, role });
      toast.success("Usuário criado!");
      setDialogOpen(false);
      setUsername("");
      setName("");
      setPassword("");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar");
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    admins: users.filter(u => u.role === "admin").length,
    gerentes: users.filter(u => u.role === "gerente").length,
    auxiliares: users.filter(u => u.role === "auxiliar").length,
    total: users.length
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
            <Users className="w-6 h-6 text-purple-400" />
            Usuários
          </h1>
          <p className="text-zinc-500 text-sm mt-0.5">Gerenciar usuários do sistema</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Novo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Usuário</Label>
                  <Input
                    type="text"
                    placeholder="nome.usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Nome</Label>
                  <Input
                    placeholder="Nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Senha</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800/50 border-zinc-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-400 text-xs uppercase">Cargo</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-zinc-800/50 border border-zinc-700 text-white"
                    disabled={allowedRoles.length === 0}
                  >
                    {allowedRoles.map((r) => (
                      <option key={r} value={r}>{roleConfig[r]?.label || r}</option>
                    ))}
                  </select>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button 
                  onClick={handleCreate} 
                  disabled={creating || !username.trim() || !name.trim() || !password.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                  Criar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button 
            variant="outline" 
            size="icon" 
            onClick={loadUsers} 
            className="border-zinc-700 hover:bg-zinc-800"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-4 gap-3">
        <button 
          onClick={() => setFilterRole("all")}
          className={`glass-card p-3 text-left transition-all ${filterRole === "all" ? "border-purple-500/50 bg-purple-500/5" : ""}`}
        >
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-500 uppercase">Total</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
        </button>
        
        <button 
          onClick={() => setFilterRole("admin")}
          className={`glass-card p-3 text-left transition-all ${filterRole === "admin" ? "border-red-500/50 bg-red-500/5" : ""}`}
        >
          <div className="flex items-center gap-2">
            <Crown className="w-4 h-4 text-red-400" />
            <span className="text-xs text-zinc-500 uppercase">Admins</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.admins}</p>
        </button>
        
        <button 
          onClick={() => setFilterRole("gerente")}
          className={`glass-card p-3 text-left transition-all ${filterRole === "gerente" ? "border-purple-500/50 bg-purple-500/5" : ""}`}
        >
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-zinc-500 uppercase">Gerentes</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.gerentes}</p>
        </button>
        
        <button 
          onClick={() => setFilterRole("auxiliar")}
          className={`glass-card p-3 text-left transition-all ${filterRole === "auxiliar" ? "border-blue-500/50 bg-blue-500/5" : ""}`}
        >
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-zinc-500 uppercase">Auxiliares</span>
          </div>
          <p className="text-xl font-bold text-white mt-1">{stats.auxiliares}</p>
        </button>
      </motion.div>

      {/* Search */}
      <motion.div variants={item} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Buscar por nome ou usuário..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-zinc-800/50 border-zinc-700"
        />
      </motion.div>

      {/* Users List */}
      <motion.div variants={item} className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-purple-400" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 mx-auto mb-3 text-zinc-600" />
            <p className="text-zinc-500">{users.length === 0 ? "Nenhum usuário" : "Nenhum resultado"}</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {filteredUsers.map((user) => {
              const roleInfo = roleConfig[user.role] || roleConfig.auxiliar;
              const RoleIcon = roleInfo.icon;
              const canEdit = user.id === Number(currentUser?.id) || currentUser?.role === "admin";
              const canDelete = currentUser?.role === "admin" && user.role !== "admin";
              
              return (
                <motion.div
                  key={user.id}
                  variants={item}
                  className="p-4 hover:bg-zinc-800/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{user.name}</span>
                          <Badge className={`${roleInfo.color} text-xs border`}>
                            <RoleIcon className="w-3 h-3 mr-1" />
                            {roleInfo.label}
                          </Badge>
                          {user.active && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400" title="Ativo" />
                          )}
                        </div>
                        <p className="text-xs text-zinc-500">@{user.username}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {canEdit && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(user)}
                            className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-800"
                            title="Editar"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openPasswordDialog(user)}
                            className="h-8 w-8 text-amber-400 hover:bg-amber-500/10"
                            title="Alterar senha"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(user.id, user.username)}
                          className="h-8 w-8 text-red-400 hover:bg-red-500/10"
                          title="Deletar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Editar Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase">Nome</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase">Usuário</Label>
              <Input
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            {currentUser?.role === "admin" && editingUser?.role !== "admin" && (
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase">Cargo</Label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-zinc-800/50 border border-zinc-700 text-white"
                >
                  <option value="gerente">Gerente</option>
                  <option value="auxiliar">Auxiliar</option>
                </select>
              </div>
            )}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button 
              onClick={handleEdit} 
              disabled={saving}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-amber-400" />
              Alterar Senha - {passwordUserName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {passwordUserId === Number(currentUser?.id) && (
              <div className="space-y-2">
                <Label className="text-zinc-400 text-xs uppercase">Senha Atual</Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-zinc-800/50 border-zinc-700"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase">Nova Senha</Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-400 text-xs uppercase">Confirmar</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button 
              onClick={handleChangePassword} 
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Key className="w-4 h-4 mr-2" />}
              Alterar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
