package com.br.careplus.domain.service;

import com.br.careplus.api.dto.notification.NotificationDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Centraliza o envio de notificações em tempo real via STOMP/WebSocket.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /** Emite evento no tópico de feed de um usuário. */
    public void notificarFeed(Long userId, NotificationDTO notif) {
        enviar("/topic/feed/" + userId, notif);
    }

    /** Emite evento no tópico de conexões de um usuário. */
    public void notificarConexao(Long userId, NotificationDTO notif) {
        enviar("/topic/conexoes/" + userId, notif);
    }

    /** Emite evento no tópico de desafios de um usuário. */
    public void notificarDesafio(Long userId, NotificationDTO notif) {
        enviar("/topic/desafios/" + userId, notif);
    }

    private void enviar(String destino, NotificationDTO notif) {
        try {
            log.debug("[WS] → {} | tipo={}", destino, notif.getTipo());
            messagingTemplate.convertAndSend(destino, notif);
        } catch (Exception e) {
            // Nunca deixa falha de notificação derrubar a operação principal
            log.warn("[WS] Falha ao enviar para {}: {}", destino, e.getMessage());
        }
    }
}