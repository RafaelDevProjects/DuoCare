package com.br.careplus.api.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 2, max = 100) String nome,
        @Size(max = 300) String bio,
        String fotoUrl
) {}