package com.br.careplus.api.dto.desafio;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record ProgressoRequest(
        @NotNull @Min(0) Double valor
) {}