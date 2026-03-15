package com.br.careplus.api.dto.post;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PostRequest(
        @NotBlank @Size(min = 1, max = 1000) String conteudo,
        String midiaUrl,
        String tipoMidia,
        Long desafioRefId
) {}