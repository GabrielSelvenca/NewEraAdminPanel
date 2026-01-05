'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Eye, RefreshCw, Calendar, DollarSign, User, Package } from 'lucide-react';
import { client } from '@/lib/api';

interface Transaction {
  id: number;
  buyerId: string;
  buyerName: string;
  discordUsername: string;
  robloxUsername: string;
  requestedAmount: number;
  status: string;
  paymentId: string;
  pixPayload: string;
  pixQrCodeImage: string;
  createdAt: string;
  paidAt?: string;
  completedAt?: string;
  cancelledAt?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterStatus]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(filterStatus !== 'all' && { status: filterStatus }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await client.request(`/api/orders?${params}`, { method: 'GET' });
      setTransactions(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      alert('Erro ao carregar transações');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'outline' | 'destructive'; label: string; emoji: string }> = {
      NEW: { variant: 'secondary', label: 'Novo', emoji: '🆕' },
      ASSIGNED: { variant: 'default', label: 'Atribuído', emoji: '📋' },
      PAYMENT_PENDING: { variant: 'outline', label: 'Aguardando Pagamento', emoji: '⏳' },
      PAID: { variant: 'default', label: 'Pago', emoji: '💰' },
      DONE: { variant: 'default', label: 'Completo', emoji: '✅' },
      CANCELLED: { variant: 'destructive', label: 'Cancelado', emoji: '❌' },
    };

    const config = variants[status] || { variant: 'secondary', label: status, emoji: '❓' };
    return (
      <Badge variant={config.variant}>
        {config.emoji} {config.label}
      </Badge>
    );
  };

  const filteredTransactions = transactions.filter(t =>
    searchTerm === '' ||
    t.discordUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.robloxUsername?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.paymentId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">💳 Transações</h1>
        <p className="text-muted-foreground">
          Histórico completo de pedidos e pagamentos
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Buscar e filtrar transações</CardDescription>
            </div>
            <Button onClick={loadTransactions} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por usuário, nickname ou ID de pagamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="NEW">Novo</SelectItem>
                <SelectItem value="ASSIGNED">Atribuído</SelectItem>
                <SelectItem value="PAYMENT_PENDING">Aguardando Pagamento</SelectItem>
                <SelectItem value="PAID">Pago</SelectItem>
                <SelectItem value="DONE">Completo</SelectItem>
                <SelectItem value="CANCELLED">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transação(ões) encontrada(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando transações...
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação encontrada
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">#{transaction.id}</span>
                      {getStatusBadge(transaction.status)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {transaction.discordUsername || transaction.buyerName}
                      </span>
                      {transaction.robloxUsername && (
                        <span className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          {transaction.robloxUsername}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(transaction.createdAt).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-semibold text-lg">
                        <DollarSign className="w-5 h-5" />
                        R$ {transaction.requestedAmount.toFixed(2)}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTransaction} onOpenChange={() => setSelectedTransaction(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Transação #{selectedTransaction?.id}</DialogTitle>
            <DialogDescription>
              Informações completas do pedido e pagamento
            </DialogDescription>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Valor</p>
                  <p className="text-lg font-semibold">R$ {selectedTransaction.requestedAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Informações do Comprador</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Discord</p>
                    <p className="font-medium">{selectedTransaction.discordUsername || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Roblox</p>
                    <p className="font-medium">{selectedTransaction.robloxUsername || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {selectedTransaction.paymentId && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-3">Informações de Pagamento</h4>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">ID do Pagamento</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">
                        {selectedTransaction.paymentId}
                      </code>
                    </div>
                    {selectedTransaction.pixPayload && (
                      <div>
                        <p className="text-sm text-muted-foreground">Código PIX</p>
                        <code className="text-xs bg-muted px-2 py-1 rounded block overflow-x-auto">
                          {selectedTransaction.pixPayload.substring(0, 50)}...
                        </code>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Timeline</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Criado em:</span>
                    <span className="font-medium">
                      {new Date(selectedTransaction.createdAt).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {selectedTransaction.paidAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pago em:</span>
                      <span className="font-medium">
                        {new Date(selectedTransaction.paidAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {selectedTransaction.completedAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Completado em:</span>
                      <span className="font-medium">
                        {new Date(selectedTransaction.completedAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                  {selectedTransaction.cancelledAt && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Cancelado em:</span>
                      <span className="font-medium text-destructive">
                        {new Date(selectedTransaction.cancelledAt).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
