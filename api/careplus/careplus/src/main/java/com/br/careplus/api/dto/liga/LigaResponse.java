package com.br.careplus.api.dto.liga;

import com.br.careplus.domain.model.Liga;
import com.br.careplus.domain.model.User;

public record LigaResponse(
        String ligaNome,
        String ligaCor,
        Long pontos,
        Long pontosMinimo,
        Long pontosMaximo,
        Long pontosParaProxima
) {
    public static LigaResponse from(User user, Liga liga) {
        long paraProxima = liga.getPontosMaximo() - user.getPontos();
        return new LigaResponse(
                liga.getNome(),
                liga.getCorHex(),
                user.getPontos(),
                liga.getPontosMinimo(),
                liga.getPontosMaximo(),
                Math.max(paraProxima, 0)
        );
    }
}