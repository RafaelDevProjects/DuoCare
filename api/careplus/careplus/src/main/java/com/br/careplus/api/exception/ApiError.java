package com.br.careplus.api.exception;

import java.time.LocalDateTime;

public record ApiError(
        int status,
        String erro,
        String mensagem,
        LocalDateTime timestamp
) {
    public static ApiError of(int status, String erro, String mensagem) {
        return new ApiError(status, erro, mensagem, LocalDateTime.now());
    }
}