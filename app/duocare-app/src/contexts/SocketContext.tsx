// ============================================================
//  src/contexts/SocketContext.tsx
//  Gerencia a conexão STOMP/WebSocket e expõe o hook
//  useSubscription para que qualquer tela possa subscrever
//  um tópico sem se preocupar com connect/disconnect.
// ============================================================
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Client, StompSubscription } from '@stomp/stompjs';
import { useAuth } from './AuthContext';

// URL do endpoint WebSocket do backend
// 10.0.2.2 = localhost do host quando rodando no emulador Android
const WS_URL = 'ws://10.0.2.2:8080/ws';

// ─── Tipos ───────────────────────────────────────────────────

export interface NotificationPayload {
  tipo:
    | 'NOVO_POST'
    | 'NOVO_COMENTARIO'
    | 'NOVA_SOLICITACAO'
    | 'CONEXAO_ACEITA'
    | 'DESAFIO_CONCLUIDO';
  mensagem: string;
  dados: any;
  timestamp: number;
}

interface SocketContextData {
  connected: boolean;
  /** Referência direta ao cliente (avançado). */
  clientRef: React.MutableRefObject<Client | null>;
}

// ─── Context ─────────────────────────────────────────────────

const SocketContext = createContext<SocketContextData>({
  connected: false,
  clientRef: { current: null },
});

// ─── Provider ────────────────────────────────────────────────

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();
  const clientRef = useRef<Client | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Sem token/usuário → desconecta se estava conectado
    if (!token || !user) {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
        setConnected(false);
      }
      return;
    }

    // Cria o cliente STOMP
    const client = new Client({
      // React Native tem WebSocket global nativo — sem necessidade de polyfill
      webSocketFactory: () => new WebSocket(WS_URL),

      // Passa o JWT no header de conexão STOMP
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },

      // Tenta reconectar a cada 5 s se cair
      reconnectDelay: 5000,

      onConnect: () => {
        console.log('[WS] ✅ Conectado ao broker STOMP');
        setConnected(true);
      },

      onDisconnect: () => {
        console.log('[WS] ❌ Desconectado do broker STOMP');
        setConnected(false);
      },

      onStompError: (frame) => {
        console.error('[WS] Erro STOMP:', frame.headers?.message);
      },

      onWebSocketError: (event) => {
        console.error('[WS] Erro WebSocket:', event);
      },
    });

    client.activate();
    clientRef.current = client;

    // Cleanup: desconecta ao sair ou trocar de usuário
    return () => {
      client.deactivate();
      setConnected(false);
    };
  }, [token, user?.userId]);

  return (
    <SocketContext.Provider value={{ connected, clientRef }}>
      {children}
    </SocketContext.Provider>
  );
}

// ─── Hook base ───────────────────────────────────────────────

export function useSocket() {
  return useContext(SocketContext);
}

// ─── Hook de subscrição ──────────────────────────────────────

/**
 * Subscreve um tópico STOMP e chama `onMessage` a cada mensagem recebida.
 *
 * Re-subscreve automaticamente quando a conexão é restabelecida.
 * Cancela a subscrição quando o componente desmonta.
 *
 * @param topic    Ex: `/topic/feed/42`
 * @param onMessage Callback com o payload já parseado como objeto
 *
 * @example
 * useSubscription(`/topic/feed/${user.userId}`, (payload) => {
 *   if (payload.tipo === 'NOVO_POST') setPosts(prev => [payload.dados, ...prev]);
 * });
 */
export function useSubscription(
  topic: string,
  onMessage: (payload: NotificationPayload) => void
) {
  const { connected, clientRef } = useSocket();

  // Usa ref para o callback para evitar re-subscrição a cada render
  const callbackRef = useRef(onMessage);
  useEffect(() => {
    callbackRef.current = onMessage;
  });

  useEffect(() => {
    if (!connected || !clientRef.current?.connected) return;

    let sub: StompSubscription | null = null;

    try {
      sub = clientRef.current.subscribe(topic, (frame) => {
        try {
          const payload: NotificationPayload = JSON.parse(frame.body);
          callbackRef.current(payload);
        } catch (e) {
          console.error('[WS] Falha ao parsear mensagem:', e);
        }
      });
      console.log('[WS] 📡 Subscrito em', topic);
    } catch (e) {
      console.error('[WS] Falha ao subscrever:', topic, e);
    }

    return () => {
      try {
        sub?.unsubscribe();
        console.log('[WS] 🔕 Cancelou subscrição em', topic);
      } catch {}
    };
  }, [connected, topic]);
}