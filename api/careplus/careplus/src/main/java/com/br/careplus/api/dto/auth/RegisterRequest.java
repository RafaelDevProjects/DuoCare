package com.br.careplus.api.dto.auth;

import jakarta.validation.constraints.*;
public record RegisterRequest(
        @NotBlank @Size(min = 2, max = 100) String nome,
        @NotBlank @Email String email,
        @NotBlank @Size(min = 6, max = 50) String senha
) {}
