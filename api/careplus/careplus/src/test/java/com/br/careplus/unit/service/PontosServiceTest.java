package com.br.careplus.unit.service;

import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.HistoricoPontosRepository;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.domain.service.PontosService;
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
class PontosServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private HistoricoPontosRepository historicoPontosRepository;

    @InjectMocks private PontosService pontosService;

    @Test
    void adicionarPontos_deveAtualizarUsuarioESalvarHistorico() {
        User user = User.builder().id(1L).pontos(100L).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);

        pontosService.adicionarPontos(1L, 50, "Motivo teste", "TESTE", 99L);

        assertThat(user.getPontos()).isEqualTo(150L);
        verify(userRepository).save(user);
        verify(historicoPontosRepository).save(any());
    }

    @Test
    void adicionarPontos_usuarioNaoEncontrado_deveLancarExcecao() {
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> pontosService.adicionarPontos(1L, 10, "Motivo", "TIPO", 1L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Usuário não encontrado.");
    }
}