package com.br.careplus.unit.service;

import com.br.careplus.domain.model.Conexao;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.ConexaoRepository;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.domain.service.ConexaoService;
import com.br.careplus.domain.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ConexaoServiceTest {

    @Mock private ConexaoRepository conexaoRepository;
    @Mock private UserRepository userRepository;
    @Mock private NotificationService notificationService;

    @InjectMocks private ConexaoService conexaoService;

    private User solicitante, receptor;
    private Conexao conexao;

    @BeforeEach
    void setUp() {
        solicitante = User.builder().id(1L).nome("João").build();
        receptor = User.builder().id(2L).nome("Maria").build();
        conexao = Conexao.builder()
                .id(10L)
                .solicitante(solicitante)
                .receptor(receptor)
                .status("PENDENTE")
                .build();
    }

    @Test
    void solicitarConexao_deveCriarESalvar() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(solicitante));
        when(userRepository.findById(2L)).thenReturn(Optional.of(receptor));
        when(conexaoRepository.findEntreUsuarios(1L, 2L)).thenReturn(Optional.empty());
        when(conexaoRepository.save(any(Conexao.class))).thenReturn(conexao);

        var resultado = conexaoService.solicitarConexao(1L, 2L);

        assertThat(resultado).isNotNull();
        assertThat(resultado.getStatus()).isEqualTo("PENDENTE");
        verify(conexaoRepository).save(any(Conexao.class));
        verify(notificationService).notificarConexao(eq(2L), any());
    }

    @Test
    void solicitarConexao_paraSiMesmo_deveLancarExcecao() {
        assertThatThrownBy(() -> conexaoService.solicitarConexao(1L, 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Você não pode se conectar consigo mesmo.");
    }

    @Test
    void responderSolicitacao_aceitar() {
        when(conexaoRepository.findByIdComUsuarios(10L)).thenReturn(Optional.of(conexao));
        when(conexaoRepository.save(any(Conexao.class))).thenReturn(conexao);

        var resultado = conexaoService.responderSolicitacao(10L, 2L, true);

        assertThat(resultado.getStatus()).isEqualTo("ACEITO");
        verify(notificationService).notificarConexao(eq(1L), any());
    }
}