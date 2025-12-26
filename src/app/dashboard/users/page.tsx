"use client";

import { useEffect, useState } from "react";
import { api, AdminUser } from "@/lib/api";
import { useUser } from "@/lib/user-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, RefreshCw, Users, Loader2, Trash2, Pencil, Key, UserCog } from "lucide-react";
import { toast } from "@/lib/error-handling";

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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAllowedRoles = async () => {
    try {
      const roles = await api.getAllowedRoles();
      setAllowedRoles(roles);
      if (roles.length > 0) setRole(roles[0]);
    } catch (err) {
      console.error(err);
      // Fallback: usa role do contexto se API falhar
      if (currentUser?.role === "admin") {
        setAllowedRoles(["gerente", "auxiliar"]);
        setRole("gerente");
      }
    }
  };

  useEffect(() => {
    loadUsers();
    loadAllowedRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "admin": return "bg-red-500/20 text-red-400";
      case "gerente": return "bg-purple-500/20 text-purple-400";
      case "auxiliar": return "bg-blue-500/20 text-blue-400";
      default: return "bg-zinc-700 text-zinc-400";
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "admin": return "Admin";
      case "gerente": return "Gerente";
      case "auxiliar": return "Auxiliar";
      default: return role;
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Deletar o usuário "${username}"?`)) return;
    try {
      await api.deleteUser(id);
      toast.success("Usuário deletado com sucesso");
      await loadUsers();
    } catch (err) {
      toast.error("Erro ao deletar usuário", err instanceof Error ? err.message : undefined);
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
      setError("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres");
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
      setPasswordDialogOpen(false);
      toast.success("Senha alterada com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao alterar senha");
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
      setDialogOpen(false);
      setUsername("");
      setName("");
      setPassword("");
      setRole("admin");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar usuário");
    } finally {
      setCreating(false);
    }
  };

  // Filtered users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-100">Usuários</h1>
          <p className="text-zinc-400 mt-1">Gerencie os usuários administradores</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Usuário
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-zinc-100">Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Usuário</Label>
                  <Input
                    type="text"
                    placeholder="nome.usuario"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Nome</Label>
                  <Input
                    placeholder="Nome do usuário"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Senha</Label>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Cargo</Label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100"
                    disabled={allowedRoles.length === 0}
                  >
                    {allowedRoles.map((r) => (
                      <option key={r} value={r}>
                        {r.charAt(0).toUpperCase() + r.slice(1)}
                      </option>
                    ))}
                  </select>
                  {allowedRoles.length === 0 && (
                    <p className="text-yellow-400 text-xs">Você não tem permissão para criar usuários</p>
                  )}
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <Button 
                  onClick={handleCreate} 
                  disabled={creating || !username.trim() || !name.trim() || !password.trim()}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                  {creating ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={loadUsers} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nome ou usuário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-zinc-800 border-zinc-700 text-zinc-100"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="h-10 px-4 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100"
        >
          <option value="all">Todos os cargos</option>
          <option value="admin">Admin</option>
          <option value="gerente">Gerente</option>
          <option value="auxiliar">Auxiliar</option>
        </select>
        <div className="text-zinc-500 text-sm">
          {filteredUsers.length} de {users.length} usuários
        </div>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
              <Users className="w-12 h-12 mb-4" />
              <p>{users.length === 0 ? "Nenhum usuário cadastrado" : "Nenhum resultado encontrado"}</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">ID</TableHead>
                  <TableHead className="text-zinc-400">Usuário</TableHead>
                  <TableHead className="text-zinc-400">Nome</TableHead>
                  <TableHead className="text-zinc-400">Cargo</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                    <TableCell className="text-zinc-300">{user.id}</TableCell>
                    <TableCell className="text-zinc-100">{user.username}</TableCell>
                    <TableCell className="text-zinc-300">{user.name}</TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeClass(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        className={user.active ? "bg-emerald-500/20 text-emerald-400" : "bg-zinc-700 text-zinc-400"}
                      >
                        {user.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Editar - próprio perfil ou admin */}
                        {(user.id === Number(currentUser?.id) || currentUser?.role === "admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                            className="text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                            title="Editar usuário"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        )}
                        {/* Alterar senha - próprio ou admin */}
                        {(user.id === Number(currentUser?.id) || currentUser?.role === "admin") && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openPasswordDialog(user)}
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                            title="Alterar senha"
                          >
                            <Key className="w-4 h-4" />
                          </Button>
                        )}
                        {/* Deletar - só admin e não pode deletar admin */}
                        {currentUser?.role === "admin" && user.role !== "admin" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(user.id, user.username)}
                            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Deletar usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Editar Usuário
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-zinc-300">Nome</Label>
              <Input
                placeholder="Nome do usuário"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Usuário</Label>
              <Input
                type="text"
                placeholder="nome.usuario"
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            {currentUser?.role === "admin" && editingUser?.role !== "admin" && (
              <div className="space-y-2">
                <Label className="text-zinc-300">Cargo</Label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full h-10 px-3 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-100"
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
              className="w-full bg-emerald-600 hover:bg-emerald-700"
            >
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pencil className="w-4 h-4 mr-2" />}
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-zinc-100 flex items-center gap-2">
              <Key className="w-5 h-5 text-yellow-400" />
              Alterar Senha - {passwordUserName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {passwordUserId === Number(currentUser?.id) && (
              <div className="space-y-2">
                <Label className="text-zinc-300">Senha Atual</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-zinc-300">Nova Senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Confirmar Nova Senha</Label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button 
              onClick={handleChangePassword} 
              disabled={changingPassword || !newPassword || !confirmPassword}
              className="w-full bg-yellow-600 hover:bg-yellow-700"
            >
              {changingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Key className="w-4 h-4 mr-2" />}
              {changingPassword ? "Alterando..." : "Alterar Senha"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
