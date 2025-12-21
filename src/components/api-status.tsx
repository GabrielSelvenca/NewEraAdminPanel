"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, X, Wifi, WifiOff } from "lucide-react";
import { api } from "@/lib/api";

export function ApiStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkApiStatus = async () => {
    if (checking) return;
    setChecking(true);
    try {
      await api.healthCheck();
      setIsOnline(true);
      setDismissed(false);
    } catch {
      setIsOnline(false);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Verifica a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  // Intercepta erros de requisição
  useEffect(() => {
    const handleOffline = () => setIsOnline(false);
    const handleOnline = () => checkApiStatus();
    
    window.addEventListener('api-offline', handleOffline);
    window.addEventListener('api-online', handleOnline);
    
    return () => {
      window.removeEventListener('api-offline', handleOffline);
      window.removeEventListener('api-online', handleOnline);
    };
  }, []);

  if (isOnline || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-4">
      <div className="bg-red-950 border border-red-800 rounded-xl p-4 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-900/50 rounded-lg">
            <WifiOff className="w-5 h-5 text-red-400" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-red-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              API Fora do Ar
            </h4>
            <p className="text-red-300/80 text-sm mt-1">
              O servidor está temporariamente indisponível. Algumas funcionalidades podem não funcionar corretamente.
            </p>
            <button
              onClick={checkApiStatus}
              disabled={checking}
              className="mt-3 text-sm text-red-300 hover:text-red-200 underline flex items-center gap-1"
            >
              <Wifi className="w-3 h-3" />
              {checking ? "Verificando..." : "Tentar reconectar"}
            </button>
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="text-red-400 hover:text-red-300 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
