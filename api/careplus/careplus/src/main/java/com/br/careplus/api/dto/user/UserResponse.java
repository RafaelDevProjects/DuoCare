package com.br.careplus.api.dto.user;

import java.time.LocalDateTime;
public record UserResponse(Long id, String nome, String email, String fotoUrl, String bio, Long pontos, LocalDateTime criadoEm) {}
