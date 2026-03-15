package com.br.careplus.domain.service;

import com.br.careplus.api.dto.desafio.*;
import com.br.careplus.domain.model.*;
import com.br.careplus.domain.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DesafioService {

    private final DesafioRepository desafioRepository;
    private final UserDesafioRepository userDesafioRepository;
    private final UserRepository userRepository;
    private final PontosService pontosService;

    public List<Desafio> listarDisponiveis() {
        return desafioRepository.findByAtivoTrue();
    }

    public List<UserDesafio> listarAtivosDoUsuario(Long userId) {
        return userDesafioRepository.findByUserIdAndStatus(userId, "EM_ANDAMENTO");
    }

    @Transactional
    public UserDesafio iniciarDesafio(Long userId, Long desafioId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        Desafio desafio = desafioRepository.findById(desafioId)
                .orElseThrow(() -> new IllegalArgumentException("Desafio não encontrado."));

        boolean jaAtivo = userDesafioRepository
                .existsByUserIdAndDesafioIdAndStatus(userId, desafioId, "EM_ANDAMENTO");
        if (jaAtivo) throw new IllegalStateException("Desafio já iniciado.");

        return userDesafioRepository.save(UserDesafio.builder()
                .user(user)
                .desafio(desafio)
                .build());
    }

    @Transactional
    public UserDesafio atualizarProgresso(Long userId, Long userDesafioId, Double novoProgresso) {
        UserDesafio ud = userDesafioRepository.findById(userDesafioId)
                .orElseThrow(() -> new IllegalArgumentException("Registro não encontrado."));

        if (!ud.getUser().getId().equals(userId)) {
            throw new SecurityException("Acesso negado.");
        }

        ud.setProgressoAtual(novoProgresso);

        // Verifica se a meta foi atingida
        if (novoProgresso >= ud.getDesafio().getMetaValor()) {
            ud.setStatus("CONCLUIDO");
            ud.setConcluidoEm(LocalDateTime.now());
            int pontos = ud.getDesafio().getPontosRecompensa();
            ud.setPontosGanhos(pontos);
            pontosService.adicionarPontos(userId, pontos,
                    "Desafio concluído: " + ud.getDesafio().getTitulo(),
                    "DESAFIO", ud.getDesafio().getId());
        }

        return userDesafioRepository.save(ud);
    }
}