package com.br.careplus.domain.service;

import com.br.careplus.api.dto.post.*;
import com.br.careplus.domain.model.*;
import com.br.careplus.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final CurtidaRepository curtidaRepository;
    private final ComentarioRepository comentarioRepository;
    private final UserRepository userRepository;
    private final DesafioRepository desafioRepository;

    public Page<PostResponse> listarFeed(Long userId, int pagina, int tamanho) {
        Page<Post> posts = postRepository.findFeedConexoes(userId, PageRequest.of(pagina, tamanho));
        return posts.map(p -> toResponse(p, userId));
    }

    public Page<PostResponse> listarFeedGlobal(Long userId, int pagina, int tamanho) {
        Page<Post> posts = postRepository.findFeedGlobal(PageRequest.of(pagina, tamanho));
        return posts.map(p -> toResponse(p, userId));
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
        return toResponse(post, userId);
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
        long curtidas = curtidaRepository.countByPostId(p.getId());
        long comentarios = comentarioRepository.countByPostIdAndAtivoTrue(p.getId());
        boolean curtidoPorMim = curtidaRepository.existsByPostIdAndUserId(p.getId(), userId);
        return PostResponse.from(p, curtidas, comentarios, curtidoPorMim);
    }
}