"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart } from "lucide-react";

export default function SellersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Vendedores</h1>
        <p className="text-zinc-400 mt-1">Gerencie vendedores do marketplace</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100">Em Desenvolvimento</CardTitle>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-zinc-600" />
          <p className="text-zinc-400 text-lg">
            Página de gerenciamento de vendedores em desenvolvimento
          </p>
          <p className="text-zinc-500 text-sm mt-2">
            Em breve você poderá adicionar, editar e gerenciar vendedores do marketplace
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
