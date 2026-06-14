package com.br.careplus.unit.service;

import com.br.careplus.api.dto.post.PostRequest;
import com.br.careplus.domain.model.*;
import com.br.careplus.domain.repository.*;
import com.br.careplus.domain.service.PostService;
import com.br.careplus.domain.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock private PostRepository postRepository;
    @Mock private CurtidaRepository curtidaRepository;
    @Mock private ComentarioRepository comentarioRepository;
    @Mock private UserRepository userRepository;
    @Mock private DesafioRepository desafioRepository;
    @Mock private ConexaoRepository conexaoRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private PostService postService;

    private User user;
    private Post post;
    private PostRequest postRequest;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).nome("João").build();
        post = Post.builder().id(10L).user(user).conteudo("Meu primeiro post").build();
        postRequest = new PostRequest("Conteúdo do post", null, null, null);
    }

    @Test
    void criarPost_deveSalvarENotificar() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(postRepository.save(any(Post.class))).thenAnswer(invocation -> {
            Post p = invocation.getArgument(0);
            p.setId(10L);
            return p;
        });
        when(curtidaRepository.countByPostId(10L)).thenReturn(0L);
        when(comentarioRepository.countByPostIdAndAtivoTrue(10L)).thenReturn(0L);
        when(curtidaRepository.existsByPostIdAndUserId(10L, 1L)).thenReturn(false);
        when(conexaoRepository.findConexoesAceitas(1L)).thenReturn(List.of());

        var response = postService.criarPost(1L, postRequest);

        assertThat(response.conteudo()).isEqualTo("Conteúdo do post");
        verify(postRepository).save(any(Post.class));
    }

    @Test
    void curtirOuDescurtir_deveCurtir() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(curtidaRepository.findByPostIdAndUserId(10L, 1L)).thenReturn(Optional.empty());
        when(curtidaRepository.countByPostId(10L)).thenReturn(1L);
        when(comentarioRepository.countByPostIdAndAtivoTrue(10L)).thenReturn(0L);
        when(curtidaRepository.existsByPostIdAndUserId(10L, 1L)).thenReturn(true);

        var response = postService.curtirOuDescurtir(10L, 1L);

        assertThat(response.totalCurtidas()).isEqualTo(1);
        assertThat(response.curtidoPorMim()).isTrue();
        verify(curtidaRepository).save(any());
    }

    @Test
    void curtirOuDescurtir_deveDescurtir() {
        var curtida = Curtida.builder().id(1L).post(post).user(user).build();

        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(curtidaRepository.findByPostIdAndUserId(10L, 1L)).thenReturn(Optional.of(curtida));
        when(curtidaRepository.countByPostId(10L)).thenReturn(0L);
        when(comentarioRepository.countByPostIdAndAtivoTrue(10L)).thenReturn(0L);
        when(curtidaRepository.existsByPostIdAndUserId(10L, 1L)).thenReturn(false);

        var response = postService.curtirOuDescurtir(10L, 1L);

        assertThat(response.totalCurtidas()).isEqualTo(0);
        assertThat(response.curtidoPorMim()).isFalse();
        verify(curtidaRepository).delete(curtida);
    }

    @Test
    void deletarPost_deveDesativarPost() {
        when(postRepository.findById(10L)).thenReturn(Optional.of(post));
        when(postRepository.save(any(Post.class))).thenReturn(post);

        postService.deletarPost(10L, 1L);

        assertThat(post.isAtivo()).isFalse();
        verify(postRepository).save(post);
    }

    @Test
    void deletarPost_quandoNaoForDono_deveLancarExcecao() {
        User outroUser = User.builder().id(99L).build();
        Post postDeOutro = Post.builder().id(20L).user(outroUser).build();
        when(postRepository.findById(20L)).thenReturn(Optional.of(postDeOutro));

        assertThatThrownBy(() -> postService.deletarPost(20L, 1L))
                .isInstanceOf(SecurityException.class)
                .hasMessage("Acesso negado.");
    }

    @Test
    void listarFeedGlobal_deveRetornarPage() {
        var pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        var page = new org.springframework.data.domain.PageImpl<Post>(List.of(post), pageable, 1);
        when(postRepository.findFeedGlobal(pageable)).thenReturn(page);
        when(curtidaRepository.countByPostId(10L)).thenReturn(0L);
        when(comentarioRepository.countByPostIdAndAtivoTrue(10L)).thenReturn(0L);
        when(curtidaRepository.existsByPostIdAndUserId(10L, 1L)).thenReturn(false);

        var result = postService.listarFeedGlobal(1L, 0, 10);

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).conteudo()).isEqualTo("Meu primeiro post");
    }
}