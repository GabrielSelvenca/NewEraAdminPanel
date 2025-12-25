"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Gamepad2 } from "lucide-react";

export default function GamesConfigPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-zinc-100">Configurações de Jogos</h1>
        <p className="text-zinc-400 mt-1">Configurações para sistema de jogos e gamepasses</p>
      </div>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 flex items-center gap-2">
            <Gamepad2 className="w-6 h-6 text-purple-500" />
            Área em Desenvolvimento
          </CardTitle>
          <CardDescription>
            Sistema de jogos e gamepasses temporariamente desabilitado
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12 text-center">
          <Gamepad2 className="w-16 h-16 mx-auto mb-4 text-purple-600 opacity-50" />
          <p className="text-zinc-400 text-lg mb-2">
            Configurações de Jogos em Desenvolvimento
          </p>
          <p className="text-zinc-500 text-sm">
            Esta funcionalidade está temporariamente desabilitada enquanto focamos no sistema de Robux
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-zinc-100 text-sm">Funcionalidades Planejadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-zinc-400 text-sm">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Categoria de Carrinhos Gamepass
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Canal de Setup Embed Gamepass
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Mensagens personalizadas de Gamepass
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
              Integração com Roblox API
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
