package com.br.careplus.api.dto.post;

import com.br.careplus.domain.model.Comentario;

import java.time.LocalDateTime;

public record ComentarioResponse(
        Long id,
        Long userId,
        String nomeUsuario,
        String fotoUrl,
        String conteudo,
        LocalDateTime criadoEm
) {
    public static ComentarioResponse from(Comentario c) {
        return new ComentarioResponse(
                c.getId(),
                c.getUser().getId(),
                c.getUser().getNome(),
                c.getUser().getFotoUrl(),
                c.getConteudo(),
                c.getCriadoEm()
        );
    }
}