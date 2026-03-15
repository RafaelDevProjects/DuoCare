package com.br.careplus.api.dto.conexao;

import com.br.careplus.domain.model.Conexao;
import com.br.careplus.domain.model.User;

import java.time.LocalDateTime;

public record ConexaoResponse(
        Long id,
        Long userId,
        String nome,
        String fotoUrl,
        String status,
        LocalDateTime criadoEm
) {
    public static ConexaoResponse from(Conexao c, Long meId) {
        User outro = c.getSolicitante().getId().equals(meId)
                ? c.getReceptor()
                : c.getSolicitante();
        return new ConexaoResponse(
                c.getId(),
                outro.getId(),
                outro.getNome(),
                outro.getFotoUrl(),
                c.getStatus(),
                c.getCriadoEm()
        );
    }
}