package com.br.careplus.api.dto.liga;

import com.br.careplus.domain.model.Liga;
import com.br.careplus.domain.model.User;

public record RankingItemResponse(
        int posicao,
        Long userId,
        String nome,
        String fotoUrl,
        Long pontos,
        String ligaNome,
        String ligaCor
) {
    public static RankingItemResponse from(int posicao, User user, Liga liga) {
        return new RankingItemResponse(
                posicao,
                user.getId(),
                user.getNome(),
                user.getFotoUrl(),
                user.getPontos(),
                liga != null ? liga.getNome() : "Bronze",
                liga != null ? liga.getCorHex() : "#CD7F32"
        );
    }
}