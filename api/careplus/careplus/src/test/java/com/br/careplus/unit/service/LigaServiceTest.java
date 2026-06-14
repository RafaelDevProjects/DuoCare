package com.br.careplus.unit.service;

import com.br.careplus.domain.model.Liga;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.LigaRepository;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.domain.service.LigaService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class LigaServiceTest {

    @Mock private LigaRepository ligaRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks private LigaService ligaService;

    @Test
    void minhaLiga_deveRetornarLigaCorreta() {
        User user = User.builder().id(1L).pontos(1500L).build();
        Liga liga = Liga.builder().nome("Prata").pontosMinimo(1000L).pontosMaximo(2999L).corHex("#C0C0C0").build();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(ligaRepository.findByPontos(1500L)).thenReturn(Optional.of(liga));

        var response = ligaService.minhaLiga(1L);

        assertThat(response.ligaNome()).isEqualTo("Prata");
        assertThat(response.pontos()).isEqualTo(1500L);
        assertThat(response.pontosParaProxima()).isEqualTo(liga.getPontosMaximo() - user.getPontos());
    }

    @Test
    void minhaLiga_usuarioNaoEncontrado_deveLancarExcecao() {
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> ligaService.minhaLiga(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Usuário não encontrado.");
    }

    @Test
    void ranking_deveRetornarListaOrdenada() {
        User user1 = User.builder().id(1L).nome("João").pontos(1000L).build();
        User user2 = User.builder().id(2L).nome("Maria").pontos(500L).build();
        Liga ligaOuro = Liga.builder().nome("Ouro").corHex("#FBBF24").build();
        Liga ligaPrata = Liga.builder().nome("Prata").corHex("#C0C0C0").build();

        when(userRepository.findTopByPontos()).thenReturn(List.of(user1, user2));
        when(ligaRepository.findByPontos(1000L)).thenReturn(Optional.of(ligaOuro));
        when(ligaRepository.findByPontos(500L)).thenReturn(Optional.of(ligaPrata));

        var ranking = ligaService.ranking(10);

        assertThat(ranking).hasSize(2);
        assertThat(ranking.get(0).posicao()).isEqualTo(1);
        assertThat(ranking.get(0).nome()).isEqualTo("João");
        assertThat(ranking.get(0).ligaNome()).isEqualTo("Ouro");
        assertThat(ranking.get(1).posicao()).isEqualTo(2);
        assertThat(ranking.get(1).nome()).isEqualTo("Maria");
    }

    @Test
    void buscarLigaPorUsuarioId_quandoNaoEncontra_retornaLigaBronzePadrao() {
        User user = User.builder().id(1L).pontos(99999L).build();
        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(ligaRepository.findByPontos(99999L)).thenReturn(Optional.empty());

        var liga = ligaService.buscarLigaPorUsuarioId(1L);

        assertThat(liga.getNome()).isEqualTo("Bronze");
        assertThat(liga.getCorHex()).isEqualTo("#CD7F32");
    }
}