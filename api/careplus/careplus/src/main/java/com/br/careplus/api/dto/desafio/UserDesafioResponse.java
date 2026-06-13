package com.br.careplus.api.dto.desafio;

import com.br.careplus.domain.model.Desafio;
import com.br.careplus.domain.model.UserDesafio;

import java.time.LocalDateTime;

public record UserDesafioResponse(
        Long id,
        Long desafioId,
        String tituloDesafio,
        String descricao,            // novo
        String dicas,                // novo
        Double metaValor,
        String metaUnidade,
        Double progressoAtual,
        Double percentual,
        String status,
        Integer pontosGanhos,
        LocalDateTime iniciadoEm,
        LocalDateTime concluidoEm,
        String nivel,
        String categoriaNome,
        LocalDateTime prazoFinal      // novo
) {
    public static UserDesafioResponse from(UserDesafio ud) {
        Desafio d = ud.getDesafio();
        double percentual = d.getMetaValor() > 0
                ? (ud.getProgressoAtual() / d.getMetaValor()) * 100
                : 0;
        LocalDateTime prazo = ud.getIniciadoEm().plusDays(d.getDuracaoDias());

        return new UserDesafioResponse(
                ud.getId(),
                d.getId(),
                d.getTitulo(),
                d.getDescricao(),          // ← descrição do desafio
                d.getDicas(),              // ← dicas do desafio
                d.getMetaValor(),
                d.getMetaUnidade(),
                ud.getProgressoAtual(),
                Math.min(percentual, 100),
                ud.getStatus(),
                ud.getPontosGanhos(),
                ud.getIniciadoEm(),
                ud.getConcluidoEm(),
                d.getNivel(),
                d.getCategoria() != null ? d.getCategoria().getNome() : null,
                prazo                      // ← prazo calculado
        );
    }
}