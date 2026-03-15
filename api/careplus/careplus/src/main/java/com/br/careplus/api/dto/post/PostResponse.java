package com.br.careplus.api.dto.post;

import com.br.careplus.domain.model.Post;

import java.time.LocalDateTime;

public record PostResponse(
        Long id,
        Long userId,
        String nomeUsuario,
        String fotoUsuario,
        String conteudo,
        String midiaUrl,
        String tipoMidia,
        Long desafioRefId,
        long totalCurtidas,
        long totalComentarios,
        boolean curtidoPorMim,
        LocalDateTime criadoEm
) {
    public static PostResponse from(Post p, long curtidas, long comentarios, boolean curtidoPorMim) {
        return new PostResponse(
                p.getId(),
                p.getUser().getId(),
                p.getUser().getNome(),
                p.getUser().getFotoUrl(),
                p.getConteudo(),
                p.getMidiaUrl(),
                p.getTipoMidia(),
                p.getDesafioRef() != null ? p.getDesafioRef().getId() : null,
                curtidas,
                comentarios,
                curtidoPorMim,
                p.getCriadoEm()
        );
    }
}