package com.br.careplus.api.dto.notification;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Payload genérico enviado via WebSocket para o cliente mobile.
 *
 * O campo "tipo" é usado pelo app para decidir o que fazer:
 *   NOVO_POST         → prepend no feed
 *   NOVO_COMENTARIO   → atualiza contador do post
 *   NOVA_SOLICITACAO  → incrementa badge de pendentes
 *   CONEXAO_ACEITA    → mostra toast / atualiza lista
 *   DESAFIO_CONCLUIDO → atualiza pontos do usuário
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationDTO {

    private String tipo;
    private String mensagem;
    private Object dados;       // PostResponse, ConexaoResponse, UserDesafioResponse...
    private long   timestamp;

    // ─── Factory methods ─────────────────────────────────────

    public static NotificationDTO novoPost(Object postResponse, String nomeAutor) {
        return NotificationDTO.builder()
                .tipo("NOVO_POST")
                .mensagem(nomeAutor + " publicou um novo post")
                .dados(postResponse)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static NotificationDTO novoComentario(Object postResponse, String nomeComentador) {
        return NotificationDTO.builder()
                .tipo("NOVO_COMENTARIO")
                .mensagem(nomeComentador + " comentou no seu post")
                .dados(postResponse)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static NotificationDTO novaSolicitacao(Object conexaoResponse, String nomeSolicitante) {
        return NotificationDTO.builder()
                .tipo("NOVA_SOLICITACAO")
                .mensagem(nomeSolicitante + " quer se conectar com você")
                .dados(conexaoResponse)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static NotificationDTO conexaoAceita(Object conexaoResponse, String nomeReceptor) {
        return NotificationDTO.builder()
                .tipo("CONEXAO_ACEITA")
                .mensagem(nomeReceptor + " aceitou sua solicitação de conexão!")
                .dados(conexaoResponse)
                .timestamp(System.currentTimeMillis())
                .build();
    }

    public static NotificationDTO desafioConcluido(Object userDesafioResponse, int pontos) {
        return NotificationDTO.builder()
                .tipo("DESAFIO_CONCLUIDO")
                .mensagem("🎉 Desafio concluído! Você ganhou " + pontos + " pontos")
                .dados(userDesafioResponse)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}