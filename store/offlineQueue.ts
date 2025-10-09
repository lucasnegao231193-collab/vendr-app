/**
 * Store Zustand com IndexedDB para fila offline de vendas
 * Sincroniza automaticamente quando a conexão retorna
 */
import { create } from "zustand";
import { openDB, IDBPDatabase } from "idb";
import { VendaInput } from "@/lib/validation";

// ============================================
// TYPES
// ============================================

interface VendaOffline extends VendaInput {
  id: string;
  timestamp: number;
  synced: boolean;
}

interface OfflineQueueState {
  queue: VendaOffline[];
  isSyncing: boolean;
  isOnline: boolean;
  init: () => Promise<void>;
  addToQueue: (venda: VendaInput) => Promise<void>;
  sync: () => Promise<void>;
  removeFromQueue: (id: string) => Promise<void>;
  getQueueSize: () => number;
}

// ============================================
// INDEXEDDB
// ============================================

let db: IDBPDatabase | null = null;

async function getDB() {
  if (db) return db;

  db = await openDB("vendr-offline", 1, {
    upgrade(db) {
      const store = db.createObjectStore("vendas_queue", { keyPath: "id" });
      store.createIndex("timestamp", "timestamp");
      store.createIndex("synced", "synced");
    },
  });

  return db;
}

// ============================================
// ZUSTAND STORE
// ============================================

export const useOfflineQueue = create<OfflineQueueState>((set, get) => ({
  queue: [],
  isSyncing: false,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,

  /**
   * Inicializa o store: carrega fila do IndexedDB e configura listeners
   */
  init: async () => {
    try {
      const database = await getDB();
      const allItems = await database.getAll("vendas_queue");
      const pendingItems = allItems.filter((item) => !item.synced);

      set({ queue: pendingItems });

      // Configurar listeners de conexão
      if (typeof window !== "undefined") {
        const handleOnline = () => {
          set({ isOnline: true });
          // Auto-sync quando ficar online
          setTimeout(() => {
            get().sync();
          }, 1000);
        };

        const handleOffline = () => {
          set({ isOnline: false });
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);
      }
    } catch (error) {
      console.error("Erro ao inicializar offline queue:", error);
    }
  },

  /**
   * Adiciona venda à fila offline
   */
  addToQueue: async (venda: VendaInput) => {
    try {
      const database = await getDB();
      const vendaOffline: VendaOffline = {
        ...venda,
        id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
        synced: false,
      };

      await database.add("vendas_queue", vendaOffline);

      set((state) => ({
        queue: [...state.queue, vendaOffline],
      }));

      // Se estiver online, tenta sincronizar imediatamente
      if (get().isOnline) {
        setTimeout(() => {
          get().sync();
        }, 500);
      }
    } catch (error) {
      console.error("Erro ao adicionar à fila offline:", error);
      throw error;
    }
  },

  /**
   * Sincroniza fila com o servidor
   */
  sync: async () => {
    const { queue, isSyncing, isOnline } = get();

    if (isSyncing || !isOnline || queue.length === 0) {
      return;
    }

    set({ isSyncing: true });

    try {
      const database = await getDB();

      for (const venda of queue) {
        try {
          // POST para API
          const response = await fetch("/api/vendas", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              vendedor_id: venda.vendedor_id,
              produto_id: venda.produto_id,
              qtd: venda.qtd,
              valor_unit: venda.valor_unit,
              meio_pagamento: venda.meio_pagamento,
              status: venda.status,
            }),
          });

          if (response.ok) {
            // Marcar como sincronizado
            await database.delete("vendas_queue", venda.id);
            await get().removeFromQueue(venda.id);
          } else {
            console.error("Erro ao sincronizar venda:", await response.text());
          }
        } catch (error) {
          console.error("Erro ao sincronizar venda individual:", error);
        }
      }
    } catch (error) {
      console.error("Erro ao sincronizar fila:", error);
    } finally {
      set({ isSyncing: false });
    }
  },

  /**
   * Remove item da fila
   */
  removeFromQueue: async (id: string) => {
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    }));
  },

  /**
   * Retorna tamanho da fila
   */
  getQueueSize: () => {
    return get().queue.length;
  },
}));

// Hook para usar em componentes
export function useOfflineSync() {
  const { addToQueue, sync, queue, isSyncing, isOnline } = useOfflineQueue();

  return {
    addToQueue,
    sync,
    queueSize: queue.length,
    isSyncing,
    isOnline,
  };
}
