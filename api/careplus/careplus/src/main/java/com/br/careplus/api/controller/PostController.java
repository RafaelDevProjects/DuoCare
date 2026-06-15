package com.br.careplus.api.controller;

import com.br.careplus.api.dto.post.*;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.service.PostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@Tag(name = "Feed Social", description = "Posts, curtidas e comentários")
@SecurityRequirement(name = "bearerAuth")
public class PostController {

    private final PostService postService;

    @GetMapping
    @Operation(summary = "Feed de conexões paginado")
    public ResponseEntity<Page<PostResponse>> feed(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho) {
        return ResponseEntity.ok(postService.listarFeed(user.getId(), pagina, tamanho));
    }

    @GetMapping("/global")
    @Operation(summary = "Feed global paginado")
    public ResponseEntity<Page<PostResponse>> feedGlobal(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho) {
        return ResponseEntity.ok(postService.listarFeedGlobal(user.getId(), pagina, tamanho));
    }

    @GetMapping("/usuario/{userId}")
    @Operation(summary = "Listar posts de um usuário específico (público)")
    public ResponseEntity<Page<PostResponse>> postsPorUsuario(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho) {
        return ResponseEntity.ok(postService.listarPostsPorUsuario(currentUser.getId(), userId, pagina, tamanho));
    }

    @GetMapping("/curtidas/usuario/{userId}")
    @Operation(summary = "Listar posts curtidos por um usuário específico")
    public ResponseEntity<Page<PostResponse>> postsCurtidosPorUsuario(
            @AuthenticationPrincipal User currentUser,
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int pagina,
            @RequestParam(defaultValue = "10") int tamanho) {
        return ResponseEntity.ok(postService.listarPostsCurtidosPorUsuario(currentUser.getId(), userId, pagina, tamanho));
    }

    @PostMapping
    @Operation(summary = "Criar post")
    public ResponseEntity<PostResponse> criar(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody PostRequest request) {
        return ResponseEntity.ok(postService.criarPost(user.getId(), request));
    }

    @PostMapping("/{postId}/curtir")
    @Operation(summary = "Curtir ou descurtir post")
    public ResponseEntity<PostResponse> curtir(
            @AuthenticationPrincipal User user,
            @PathVariable Long postId) {
        return ResponseEntity.ok(postService.curtirOuDescurtir(postId, user.getId()));
    }

    @PostMapping("/{postId}/comentarios")
    @Operation(summary = "Comentar em um post")
    public ResponseEntity<ComentarioResponse> comentar(
            @AuthenticationPrincipal User user,
            @PathVariable Long postId,
            @Valid @RequestBody ComentarioRequest request) {
        return ResponseEntity.ok(postService.comentar(postId, user.getId(), request));
    }

    @GetMapping("/{postId}/comentarios")
    @Operation(summary = "Listar comentários de um post")
    public ResponseEntity<List<ComentarioResponse>> listarComentarios(@PathVariable Long postId) {
        return ResponseEntity.ok(postService.listarComentarios(postId));
    }

    @DeleteMapping("/{postId}")
    @Operation(summary = "Deletar post")
    public ResponseEntity<Void> deletar(
            @AuthenticationPrincipal User user,
            @PathVariable Long postId) {
        postService.deletarPost(postId, user.getId());
        return ResponseEntity.noContent().build();
    }
}