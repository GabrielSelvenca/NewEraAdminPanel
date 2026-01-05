'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RefreshCw, Search, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { client } from '@/lib/api';

interface WebhookEvent {
  id: number;
  eventId: string;
  eventType: string;
  paymentId: string;
  processed: boolean;
  processedAt?: string;
  errorMessage?: string;
  createdAt: string;
}

export default function WebhooksPage() {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterProcessed, setFilterProcessed] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ total: 0, processed: 0, failed: 0 });

  useEffect(() => {
    loadWebhooks();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filterProcessed]);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(filterProcessed !== 'all' && { processed: filterProcessed }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response: any = await client.request(`/api/webhooks/events?${params}`, { method: 'GET' });
      setEvents(response.data.events || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      alert('Erro ao carregar webhooks');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [totalRes, processedRes, failedRes]: any[] = await Promise.all([
        client.request('/api/webhooks/events?limit=1', { method: 'GET' }),
        client.request('/api/webhooks/events?processed=true&limit=1', { method: 'GET' }),
        client.request('/api/webhooks/events?processed=false&limit=1', { method: 'GET' }),
      ]);
      const total = totalRes.total;
      const processed = processedRes.total;
      const failed = failedRes.total;
      setStats({ total, processed, failed });
    } catch (error) {
      }
  };

  const getEventBadge = (event: WebhookEvent) => {
    if (event.errorMessage) {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="w-3 h-3" />
          Erro
        </Badge>
      );
    }
    if (event.processed) {
      return (
        <Badge variant="default" className="gap-1">
          <CheckCircle className="w-3 h-3" />
          Processado
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <AlertCircle className="w-3 h-3" />
        Pendente
      </Badge>
    );
  };

  const filteredEvents = events.filter(e =>
    searchTerm === '' ||
    e.paymentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.eventType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">🔔 Webhooks</h1>
        <p className="text-muted-foreground">
          Monitoramento de eventos do Mercado Pago
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Eventos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.processed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Com Erro</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Filtros</CardTitle>
              <CardDescription>Buscar e filtrar webhooks</CardDescription>
            </div>
            <Button onClick={loadWebhooks} variant="outline" size="sm">
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
                  placeholder="Buscar por ID de pagamento ou tipo de evento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterProcessed} onValueChange={setFilterProcessed}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Processados</SelectItem>
                <SelectItem value="false">Pendentes/Erro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Webhooks</CardTitle>
          <CardDescription>
            {filteredEvents.length} evento(s) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Carregando webhooks...
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum webhook encontrado
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">#{event.id}</span>
                      {getEventBadge(event)}
                      <Badge variant="outline">{event.eventType}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Payment ID: <code className="bg-muted px-1 rounded text-xs">{event.paymentId || 'N/A'}</code></div>
                      {event.errorMessage && (
                        <div className="text-destructive mt-1">Erro: {event.errorMessage}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm text-muted-foreground">
                      {new Date(event.createdAt).toLocaleString('pt-BR')}
                    </div>
                    {event.processedAt && (
                      <div className="text-xs text-green-600">
                        Processado: {new Date(event.processedAt).toLocaleString('pt-BR')}
                      </div>
                    )}
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
    </div>
  );
}
