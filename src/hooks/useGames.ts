"use client";

import { useState, useCallback, useEffect } from 'react';
import { games } from '@/lib/api';
import type { Game } from '@/lib/api';

export function useGames() {
  const [data, setData] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await games.getAll();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogos');
    } finally {
      setLoading(false);
    }
  }, []);

  const createGame = useCallback(async (gameData: Partial<Game>) => {
    setError(null);
    try {
      const result = await games.create(gameData);
      // Refresh list to get full game data
      await loadGames();
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar jogo';
      setError(message);
      throw err;
    }
  }, [loadGames]);

  const updateGame = useCallback(async (id: number, gameData: Partial<Game>) => {
    setError(null);
    try {
      await games.update(id, gameData);
      // Refresh to get updated data
      await loadGames();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar jogo';
      setError(message);
      throw err;
    }
  }, [loadGames]);

  const deleteGame = useCallback(async (id: number) => {
    setError(null);
    try {
      await games.delete(id);
      setData(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao deletar jogo';
      setError(message);
      throw err;
    }
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  return {
    games: data,
    loading,
    error,
    refresh: loadGames,
    createGame,
    updateGame,
    deleteGame,
  };
}

export function useGame(id: number) {
  const [data, setData] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGame = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await games.getById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar jogo');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadGame();
  }, [loadGame]);

  return {
    game: data,
    loading,
    error,
    refresh: loadGame,
  };
}
