package com.br.careplus.api.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ComentarioRequest(
        @NotBlank @Size(min = 1, max = 500) String conteudo
) {}