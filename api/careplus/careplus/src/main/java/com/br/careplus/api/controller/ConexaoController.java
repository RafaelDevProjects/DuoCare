package com.br.careplus.api.controller;

import com.br.careplus.api.dto.conexao.ConexaoResponse;
import com.br.careplus.api.dto.user.UserResponse;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.service.ConexaoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/conexoes")
@RequiredArgsConstructor
@Tag(name = "Conexões", description = "Rede social — seguir e conectar usuários")
@SecurityRequirement(name = "bearerAuth")
public class ConexaoController {

    private final ConexaoService conexaoService;

    @GetMapping
    @Operation(summary = "Listar minhas conexões aceitas")
    public ResponseEntity<List<ConexaoResponse>> listar(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                conexaoService.listarConexoes(user.getId())
                        .stream().map(c -> ConexaoResponse.from(c, user.getId())).toList()
        );
    }

    @GetMapping("/pendentes")
    @Operation(summary = "Listar solicitações recebidas pendentes")
    public ResponseEntity<List<ConexaoResponse>> pendentes(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                conexaoService.listarPendentes(user.getId())
                        .stream().map(c -> ConexaoResponse.from(c, user.getId())).toList()
        );
    }

    // 🆕
    @GetMapping("/enviadas")
    @Operation(summary = "Listar solicitações enviadas pendentes")
    public ResponseEntity<List<ConexaoResponse>> enviadas(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(
                conexaoService.listarEnviadas(user.getId())
                        .stream().map(c -> ConexaoResponse.from(c, user.getId())).toList()
        );
    }

    @PostMapping("/{receptorId}")
    @Operation(summary = "Enviar solicitação de conexão")
    public ResponseEntity<ConexaoResponse> solicitar(
            @AuthenticationPrincipal User user,
            @PathVariable Long receptorId) {
        var conexao = conexaoService.solicitarConexao(user.getId(), receptorId);
        return ResponseEntity.ok(ConexaoResponse.from(conexao, user.getId()));
    }

    @PatchMapping("/{conexaoId}/aceitar")
    @Operation(summary = "Aceitar solicitação")
    public ResponseEntity<ConexaoResponse> aceitar(
            @AuthenticationPrincipal User user,
            @PathVariable Long conexaoId) {
        var conexao = conexaoService.responderSolicitacao(conexaoId, user.getId(), true);
        return ResponseEntity.ok(ConexaoResponse.from(conexao, user.getId()));
    }

    @PatchMapping("/{conexaoId}/recusar")
    @Operation(summary = "Recusar solicitação")
    public ResponseEntity<ConexaoResponse> recusar(
            @AuthenticationPrincipal User user,
            @PathVariable Long conexaoId) {
        var conexao = conexaoService.responderSolicitacao(conexaoId, user.getId(), false);
        return ResponseEntity.ok(ConexaoResponse.from(conexao, user.getId()));
    }

    @DeleteMapping("/{conexaoId}")
    @Operation(summary = "Remover conexão")
    public ResponseEntity<Void> remover(
            @AuthenticationPrincipal User user,
            @PathVariable Long conexaoId) {
        conexaoService.removerConexao(conexaoId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/buscar")
    @Operation(summary = "Buscar usuários por nome para conectar")
    public ResponseEntity<List<UserResponse>> buscar(
            @RequestParam String nome) {
        return ResponseEntity.ok(
                conexaoService.buscarUsuarios(nome)
                        .stream().map(u -> new UserResponse(
                                u.getId(), u.getNome(), u.getEmail(),
                                u.getFotoUrl(), u.getBio(), u.getPontos(), u.getCriadoEm()
                        )).toList()
        );
    }

    @DeleteMapping("/{receptorId}/cancelar")
    @Operation(summary = "Cancelar solicitação de conexão enviada")
    public ResponseEntity<Void> cancelar(
            @AuthenticationPrincipal User user,
            @PathVariable Long receptorId) {
        conexaoService.cancelarSolicitacao(user.getId(), receptorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{userId}/contagem")
    @Operation(summary = "Contar conexões de um usuário (público)")
    public ResponseEntity<Long> contarConexoes(@PathVariable Long userId) {
        return ResponseEntity.ok(conexaoService.contarConexoes(userId));
    }
}