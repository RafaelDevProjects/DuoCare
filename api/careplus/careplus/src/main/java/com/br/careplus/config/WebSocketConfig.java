package com.br.careplus.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configura o broker STOMP sobre WebSocket.
 *
 * Endpoint de conexão : ws://<host>:8080/ws
 *
 * Tópicos disponíveis:
 *   /topic/feed/{userId}      → novo post de conexão / novo comentário no seu post
 *   /topic/conexoes/{userId}  → nova solicitação recebida / solicitação aceita
 *   /topic/desafios/{userId}  → desafio concluído e pontos ganhos
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Prefixo dos tópicos que o cliente vai subscrever
        config.enableSimpleBroker("/topic");
        // Prefixo para mensagens enviadas do cliente ao servidor via @MessageMapping
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint de handshake — sem SockJS porque React Native usa WebSocket nativo
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }
}