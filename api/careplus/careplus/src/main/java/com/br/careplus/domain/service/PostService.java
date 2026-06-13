package com.br.careplus.domain.service;

import com.br.careplus.api.dto.notification.NotificationDTO;
import com.br.careplus.api.dto.post.*;
import com.br.careplus.domain.model.*;
import com.br.careplus.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository          postRepository;
    private final CurtidaRepository       curtidaRepository;
    private final ComentarioRepository    comentarioRepository;
    private final UserRepository          userRepository;
    private final DesafioRepository       desafioRepository;
    private final ConexaoRepository       conexaoRepository;
    private final NotificationService     notificationService;

    public Page<PostResponse> listarFeed(Long userId, int pagina, int tamanho) {
        return postRepository
                .findFeedConexoes(userId, PageRequest.of(pagina, tamanho))
                .map(p -> toResponse(p, userId));
    }

    public Page<PostResponse> listarFeedGlobal(Long userId, int pagina, int tamanho) {
        return postRepository
                .findFeedGlobal(PageRequest.of(pagina, tamanho))
                .map(p -> toResponse(p, userId));
    }

    public Page<PostResponse> listarPostsPorUsuario(Long currentUserId, Long targetUserId, int pagina, int tamanho) {
        Pageable pageable = PageRequest.of(pagina, tamanho, Sort.by("criadoEm").descending());
        Page<Post> posts = postRepository.findByUserId(targetUserId, pageable);
        return posts.map(p -> toResponse(p, currentUserId));
    }

    public Page<PostResponse> listarPostsCurtidosPorUsuario(Long currentUserId, Long targetUserId, int pagina, int tamanho) {
        Pageable pageable = PageRequest.of(pagina, tamanho, Sort.by("criadoEm").descending());
        Page<Post> posts = postRepository.findCurtidasByUserId(targetUserId, pageable);
        return posts.map(p -> toResponse(p, currentUserId));
    }

    @Transactional
    public PostResponse criarPost(Long userId, PostRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Post.PostBuilder builder = Post.builder()
                .user(user)
                .conteudo(request.conteudo())
                .midiaUrl(request.midiaUrl())
                .tipoMidia(request.tipoMidia());

        if (request.desafioRefId() != null) {
            desafioRepository.findById(request.desafioRefId())
                    .ifPresent(builder::desafioRef);
        }

        Post post = postRepository.save(builder.build());
        PostResponse response = toResponse(post, userId);

        notificarConexoesNovoPost(userId, response);
        return response;
    }

    @Transactional
    public PostResponse curtirOuDescurtir(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post não encontrado."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        curtidaRepository.findByPostIdAndUserId(postId, userId).ifPresentOrElse(
                curtidaRepository::delete,
                () -> curtidaRepository.save(Curtida.builder().post(post).user(user).build())
        );

        return toResponse(post, userId);
    }

    @Transactional
    public ComentarioResponse comentar(Long postId, Long userId, ComentarioRequest request) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post não encontrado."));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Comentario comentario = comentarioRepository.save(Comentario.builder()
                .post(post)
                .user(user)
                .conteudo(request.conteudo())
                .build());

        Long donoId = post.getUser().getId();
        if (!donoId.equals(userId)) {
            PostResponse postAtualizado = toResponse(post, donoId);
            notificationService.notificarFeed(
                    donoId,
                    NotificationDTO.novoComentario(postAtualizado, user.getNome())
            );
        }

        return ComentarioResponse.from(comentario);
    }

    public List<ComentarioResponse> listarComentarios(Long postId) {
        return comentarioRepository.findByPostId(postId)
                .stream().map(ComentarioResponse::from).toList();
    }

    @Transactional
    public void deletarPost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("Post não encontrado."));

        if (!post.getUser().getId().equals(userId)) {
            throw new SecurityException("Acesso negado.");
        }

        post.setAtivo(false);
        postRepository.save(post);
    }

    private PostResponse toResponse(Post p, Long userId) {
        long curtidas    = curtidaRepository.countByPostId(p.getId());
        long comentarios = comentarioRepository.countByPostIdAndAtivoTrue(p.getId());
        boolean curtidoPorMim = curtidaRepository.existsByPostIdAndUserId(p.getId(), userId);
        return PostResponse.from(p, curtidas, comentarios, curtidoPorMim);
    }

    private void notificarConexoesNovoPost(Long autorId, PostResponse postResponse) {
        List<Conexao> conexoes = conexaoRepository.findConexoesAceitas(autorId);
        for (Conexao c : conexoes) {
            Long destinatarioId = c.getSolicitante().getId().equals(autorId)
                    ? c.getReceptor().getId()
                    : c.getSolicitante().getId();

            notificationService.notificarFeed(
                    destinatarioId,
                    NotificationDTO.novoPost(postResponse, postResponse.nomeUsuario())
            );
        }
    }
}