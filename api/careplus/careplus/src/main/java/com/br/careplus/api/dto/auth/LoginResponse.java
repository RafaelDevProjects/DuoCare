package com.br.careplus.api.dto.auth;

public record LoginResponse(String token, Long userId, String nome, Long pontos) {}
