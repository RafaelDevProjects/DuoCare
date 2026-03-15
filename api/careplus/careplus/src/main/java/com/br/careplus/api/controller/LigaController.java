package com.br.careplus.api.controller;

import com.br.careplus.api.dto.liga.LigaResponse;
import com.br.careplus.api.dto.liga.RankingItemResponse;
import com.br.careplus.domain.model.Liga;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.service.LigaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/liga")
@RequiredArgsConstructor
@Tag(name = "Liga & Ranking", description = "Sistema de ligas e ranking de pontos")
@SecurityRequirement(name = "bearerAuth")
public class LigaController {

    private final LigaService ligaService;

    @GetMapping("/minha")
    @Operation(summary = "Liga atual do usuário autenticado")
    public ResponseEntity<LigaResponse> minhaLiga(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ligaService.minhaLiga(user.getId()));
    }

    @GetMapping("/ranking")
    @Operation(summary = "Ranking global de usuários")
    public ResponseEntity<List<RankingItemResponse>> ranking(
            @RequestParam(defaultValue = "50") int limite) {
        return ResponseEntity.ok(ligaService.ranking(limite));
    }

    @GetMapping("/todas")
    @Operation(summary = "Listar todas as ligas disponíveis")
    public ResponseEntity<List<Liga>> listarLigas() {
        return ResponseEntity.ok(ligaService.listarTodasLigas());
    }
}
