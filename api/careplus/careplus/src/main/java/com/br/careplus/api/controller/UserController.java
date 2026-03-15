package com.br.careplus.api.controller;

import com.br.careplus.api.dto.user.UserResponse;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "Usuários", description = "Perfil e dados do usuário")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserRepository userRepository;

    @GetMapping("/me")
    @Operation(summary = "Retorna perfil do usuário autenticado")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(new UserResponse(
                user.getId(), user.getNome(), user.getEmail(),
                user.getFotoUrl(), user.getBio(), user.getPontos(), user.getCriadoEm()
        ));
    }

    @PutMapping("/me")
    @Operation(summary = "Atualizar perfil")
    public ResponseEntity<UserResponse> atualizar(
            @AuthenticationPrincipal User user,
            @RequestParam(required = false) String nome,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String fotoUrl) {

        if (nome != null) user.setNome(nome);
        if (bio != null) user.setBio(bio);
        if (fotoUrl != null) user.setFotoUrl(fotoUrl);

        User salvo = userRepository.save(user);
        return ResponseEntity.ok(new UserResponse(
                salvo.getId(), salvo.getNome(), salvo.getEmail(),
                salvo.getFotoUrl(), salvo.getBio(), salvo.getPontos(), salvo.getCriadoEm()
        ));
    }
}