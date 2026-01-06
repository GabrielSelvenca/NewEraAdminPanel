"use client";

import { useEffect, useState, useRef } from "react";
import { AlertTriangle, X, Wifi, WifiOff, RefreshCw, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";

type ConnectionStatus = 'online' | 'offline' | 'checking' | 'reconnecting';

export function ApiStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('checking');
  const [dismissed, setDismissed] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const checkingRef = useRef(false);
  const wasOfflineRef = useRef(false);

  const checkApiStatus = async (isManual = false) => {
    if (checkingRef.current && !isManual) return;
    
    checkingRef.current = true;
    if (isManual) setStatus('reconnecting');
    
    try {
      const isHealthy = await api.healthCheck();
      
      if (isHealthy) {
        // Se estava offline e agora está online, mostrar sucesso brevemente
        if (wasOfflineRef.current) {
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
        
        setStatus('online');
        setFailCount(0);
        setDismissed(false);
        wasOfflineRef.current = false;
      } else {
        throw new Error('Health check failed');
      }
    } catch {
      setFailCount(prev => prev + 1);
      
      // Só considera offline após 2 falhas consecutivas
      if (failCount >= 1) {
        setStatus('offline');
        wasOfflineRef.current = true;
      }
    } finally {
      checkingRef.current = false;
    }
  };

  useEffect(() => {
    // Verificar imediatamente
    checkApiStatus();
    
    // Verificar a cada 60 segundos (menos intrusivo)
    const interval = setInterval(() => checkApiStatus(), 60000);
    
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Escutar eventos de offline/online da API
  useEffect(() => {
    const handleOffline = () => {
      setFailCount(prev => prev + 1);
      if (failCount >= 1) {
        setStatus('offline');
        wasOfflineRef.current = true;
      }
    };
    
    const handleOnline = () => {
      if (wasOfflineRef.current) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
      setStatus('online');
      setFailCount(0);
      wasOfflineRef.current = false;
    };
    
    window.addEventListener('api-offline', handleOffline);
    window.addEventListener('api-online', handleOnline);
    
    return () => {
      window.removeEventListener('api-offline', handleOffline);
      window.removeEventListener('api-online', handleOnline);
    };
  }, [failCount]);

  // Escutar eventos de rede do navegador
  useEffect(() => {
    const handleBrowserOnline = () => checkApiStatus();
    const handleBrowserOffline = () => {
      setStatus('offline');
      wasOfflineRef.current = true;
    };
    
    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);
    
    return () => {
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mostrar mensagem de reconexão bem sucedida
  if (showSuccess) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
        <div className="bg-emerald-950 border border-emerald-700 rounded-xl px-4 py-3 shadow-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-200 text-sm font-medium">Conexão restabelecida</span>
        </div>
      </div>
    );
  }

  // Não mostrar nada se está online ou foi dispensado
  if (status === 'online' || status === 'checking' || dismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-4 shadow-xl max-w-sm">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${status === 'reconnecting' ? 'bg-amber-500/20' : 'bg-red-500/20'}`}>
            {status === 'reconnecting' ? (
              <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
            ) : (
              <WifiOff className="w-5 h-5 text-red-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-zinc-100 flex items-center gap-2">
              {status === 'reconnecting' ? (
                'Reconectando...'
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  Sem conexão com o servidor
                </>
              )}
            </h4>
            {status === 'offline' && (
              <p className="text-zinc-400 text-sm mt-1">
                Verifique sua internet ou aguarde o servidor voltar.
              </p>
            )}
            {status === 'offline' && (
              <button
                onClick={() => checkApiStatus(true)}
                className="mt-3 text-sm bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-3 py-1.5 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Wifi className="w-3.5 h-3.5" />
                Tentar novamente
              </button>
            )}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-zinc-500 hover:text-zinc-300 p-1 transition-colors"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
