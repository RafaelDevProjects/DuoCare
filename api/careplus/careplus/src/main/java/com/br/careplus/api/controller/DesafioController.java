package com.br.careplus.api.controller;

import com.br.careplus.api.dto.desafio.DesafioResponse;
import com.br.careplus.api.dto.desafio.ProgressoRequest;
import com.br.careplus.api.dto.desafio.UserDesafioResponse;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.service.DesafioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/desafios")
@RequiredArgsConstructor
@Tag(name = "Desafios", description = "Gerenciamento de desafios de saúde")
@SecurityRequirement(name = "bearerAuth")
public class DesafioController {

    private final DesafioService desafioService;

    @GetMapping
    @Operation(summary = "Listar todos os desafios disponíveis")
    public ResponseEntity<List<DesafioResponse>> listar() {
        return ResponseEntity.ok(
                desafioService.listarDisponiveis()
                        .stream().map(DesafioResponse::from).toList()
        );
    }

    @GetMapping("/meus")
    @Operation(summary = "Listar desafios ativos do usuário autenticado")
    public ResponseEntity<List<UserDesafioResponse>> meusDesafios(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                desafioService.listarAtivosDoUsuario(user.getId())
                        .stream().map(UserDesafioResponse::from).toList()
        );
    }

    @PostMapping("/{desafioId}/iniciar")
    @Operation(summary = "Iniciar um desafio")
    public ResponseEntity<UserDesafioResponse> iniciar(
            @AuthenticationPrincipal User user,
            @PathVariable Long desafioId) {
        return ResponseEntity.ok(
                UserDesafioResponse.from(desafioService.iniciarDesafio(user.getId(), desafioId))
        );
    }

    @PatchMapping("/progresso/{userDesafioId}")
    @Operation(summary = "Atualizar progresso de um desafio")
    public ResponseEntity<UserDesafioResponse> atualizarProgresso(
            @AuthenticationPrincipal User user,
            @PathVariable Long userDesafioId,
            @Valid @RequestBody ProgressoRequest request) {
        return ResponseEntity.ok(
                UserDesafioResponse.from(
                        desafioService.atualizarProgresso(user.getId(), userDesafioId, request.valor())
                )
        );
    }
}