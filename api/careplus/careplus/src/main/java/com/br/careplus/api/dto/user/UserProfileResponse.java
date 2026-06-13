// src/main/java/com/br/careplus/api/dto/user/UserProfileResponse.java
package com.br.careplus.api.dto.user;

import com.br.careplus.domain.model.User;
import com.br.careplus.domain.model.Liga;

public record UserProfileResponse(
        Long id,
        String nome,
        String bio,
        Long pontos,
        String ligaNome,
        String ligaCor
) {
    public static UserProfileResponse from(User user, Liga liga) {
        return new UserProfileResponse(
                user.getId(),
                user.getNome(),
                user.getBio(),
                user.getPontos(),
                liga != null ? liga.getNome() : "Bronze",
                liga != null ? liga.getCorHex() : "#CD7F32"
        );
    }
}