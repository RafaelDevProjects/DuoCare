package com.br.careplus.api.controller;

import com.br.careplus.api.dto.user.UpdateUserRequest;
import com.br.careplus.api.dto.user.UserResponse;
import com.br.careplus.api.dto.user.UserProfileResponse;
import com.br.careplus.domain.model.Liga;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.domain.service.LigaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Perfil e dados do usuário")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserRepository userRepository;
    private final LigaService ligaService;

    @GetMapping("/me")
    @Operation(summary = "Retorna perfil do usuário autenticado")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getNome(), user.getEmail(),
                user.getFotoUrl(), user.getBio(), user.getPontos(), user.getCriadoEm()
        ));
    }

    // 🆕 Endpoint atualizado para receber JSON no corpo
    @PutMapping("/me")
    @Operation(summary = "Atualizar perfil")
    public ResponseEntity<UserResponse> atualizar(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateUserRequest request) {

        if (request.nome() != null) user.setNome(request.nome());
        if (request.bio() != null) user.setBio(request.bio());
        if (request.fotoUrl() != null) user.setFotoUrl(request.fotoUrl());

        User salvo = userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(
                salvo.getId(), salvo.getNome(), salvo.getEmail(),
                salvo.getFotoUrl(), salvo.getBio(), salvo.getPontos(), salvo.getCriadoEm()
        ));
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Buscar perfil público de um usuário")
    public ResponseEntity<UserProfileResponse> getUserProfile(@PathVariable Long userId) {
        log.debug("Buscando perfil do usuário: {}", userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));

        Liga liga = null;
        try {
            liga = ligaService.buscarLigaPorUsuarioId(userId);
        } catch (Exception e) {
            log.warn("Erro ao buscar liga para usuário {}: {}", userId, e.getMessage());
            liga = Liga.builder().nome("Bronze").corHex("#CD7F32").build();
        }
        return ResponseEntity.ok(UserProfileResponse.from(user, liga));
    }
}