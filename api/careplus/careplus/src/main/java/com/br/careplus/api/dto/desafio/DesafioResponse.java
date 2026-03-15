package com.br.careplus.api.dto.desafio;

import com.br.careplus.domain.model.Desafio;

public record DesafioResponse(
        Long id,
        String titulo,
        String descricao,
        Double metaValor,
        String metaUnidade,
        Integer pontosRecompensa,
        Integer duracaoDias,
        String nivel,
        String categoriaNome
) {
    public static DesafioResponse from(Desafio d) {
        return new DesafioResponse(
                d.getId(),
                d.getTitulo(),
                d.getDescricao(),
                d.getMetaValor(),
                d.getMetaUnidade(),
                d.getPontosRecompensa(),
                d.getDuracaoDias(),
                d.getNivel(),
                d.getCategoria() != null ? d.getCategoria().getNome() : null
        );
    }
}