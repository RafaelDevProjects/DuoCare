package com.br.careplus.unit.service;

import com.br.careplus.domain.model.*;
import com.br.careplus.domain.repository.*;
import com.br.careplus.domain.service.DesafioService;
import com.br.careplus.domain.service.PontosService;
import com.br.careplus.domain.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DesafioServiceTest {

    @Mock private DesafioRepository desafioRepository;
    @Mock private UserDesafioRepository userDesafioRepository;
    @Mock private UserRepository userRepository;
    @Mock private PontosService pontosService;
    @Mock private NotificationService notificationService;

    @InjectMocks private DesafioService desafioService;

    private User user;
    private Desafio desafio;
    private UserDesafio userDesafio;

    @BeforeEach
    void setUp() {
        user = User.builder().id(1L).nome("João").pontos(0L).build();
        desafio = Desafio.builder()
                .id(10L)
                .titulo("Corrida 5km")
                .metaValor(5.0)
                .pontosRecompensa(100)
                .duracaoDias(7)
                .build();
        userDesafio = UserDesafio.builder()
                .id(100L)
                .user(user)
                .desafio(desafio)
                .progressoAtual(0.0)
                .status("EM_ANDAMENTO")
                .iniciadoEm(LocalDateTime.now())
                .build();
    }

    @Test
    void listarDisponiveis_deveRetornarLista() {
        when(desafioRepository.findByAtivoTrue()).thenReturn(java.util.List.of(desafio));

        var lista = desafioService.listarDisponiveis();

        assertThat(lista).hasSize(1);
        assertThat(lista.get(0).getTitulo()).isEqualTo("Corrida 5km");
    }

    @Test
    void iniciarDesafio_deveSalvarNovoUserDesafio() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(desafioRepository.findById(10L)).thenReturn(Optional.of(desafio));
        when(userDesafioRepository.existsByUserIdAndDesafioIdAndStatus(1L, 10L, "EM_ANDAMENTO"))
                .thenReturn(false);
        when(userDesafioRepository.save(any(UserDesafio.class))).thenReturn(userDesafio);
        when(userDesafioRepository.findByIdWithCategoria(100L)).thenReturn(Optional.of(userDesafio));

        var result = desafioService.iniciarDesafio(1L, 10L);

        assertThat(result).isNotNull();
        assertThat(result.getProgressoAtual()).isZero();
        verify(userDesafioRepository).save(any(UserDesafio.class));
    }

    @Test
    void iniciarDesafio_deveLancarExcecaoQuandoJaAtivo() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(desafioRepository.findById(10L)).thenReturn(Optional.of(desafio));
        when(userDesafioRepository.existsByUserIdAndDesafioIdAndStatus(1L, 10L, "EM_ANDAMENTO"))
                .thenReturn(true);

        assertThatThrownBy(() -> desafioService.iniciarDesafio(1L, 10L))
                .isInstanceOf(IllegalStateException.class)
                .hasMessage("Desafio já iniciado.");
    }

    @Test
    void atualizarProgresso_deveConcederPontosQuandoCompleto() {
        UserDesafio udCompleto = UserDesafio.builder()
                .id(100L)
                .user(user)
                .desafio(desafio)
                .progressoAtual(5.0)
                .status("EM_ANDAMENTO")
                .iniciadoEm(LocalDateTime.now())
                .build();

        when(userDesafioRepository.findByIdWithCategoria(100L)).thenReturn(Optional.of(udCompleto));
        when(userDesafioRepository.save(any(UserDesafio.class))).thenReturn(udCompleto);

        var resultado = desafioService.atualizarProgresso(1L, 100L, 5.0);

        assertThat(resultado.getStatus()).isEqualTo("CONCLUIDO");
        assertThat(resultado.getPontosGanhos()).isEqualTo(100);
        verify(pontosService).adicionarPontos(eq(1L), eq(100), anyString(), eq("DESAFIO"), eq(10L));
        verify(notificationService).notificarDesafio(eq(1L), any());
    }

    @Test
    void listarTodosDesafiosDoUsuario_deveRetornarLista() {
        when(userDesafioRepository.findAllByUserId(1L)).thenReturn(java.util.List.of(userDesafio));

        var lista = desafioService.listarTodosDesafiosDoUsuario(1L);

        assertThat(lista).hasSize(1);
        assertThat(lista.get(0).getId()).isEqualTo(100L);
    }
}