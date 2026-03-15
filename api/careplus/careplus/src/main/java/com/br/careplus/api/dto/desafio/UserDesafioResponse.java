package com.br.careplus.api.dto.desafio;

import com.br.careplus.domain.model.UserDesafio;

import java.time.LocalDateTime;

public record UserDesafioResponse(
        Long id,
        Long desafioId,
        String tituloDesafio,
        Double metaValor,
        String metaUnidade,
        Double progressoAtual,
        Double percentual,
        String status,
        Integer pontosGanhos,
        LocalDateTime iniciadoEm,
        LocalDateTime concluidoEm
) {
    public static UserDesafioResponse from(UserDesafio ud) {
        double percentual = ud.getDesafio().getMetaValor() > 0
                ? (ud.getProgressoAtual() / ud.getDesafio().getMetaValor()) * 100
                : 0;
        return new UserDesafioResponse(
                ud.getId(),
                ud.getDesafio().getId(),
                ud.getDesafio().getTitulo(),
                ud.getDesafio().getMetaValor(),
                ud.getDesafio().getMetaUnidade(),
                ud.getProgressoAtual(),
                Math.min(percentual, 100),
                ud.getStatus(),
                ud.getPontosGanhos(),
                ud.getIniciadoEm(),
                ud.getConcluidoEm()
        );
    }
}