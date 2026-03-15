package com.br.careplus.domain.service;

import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.HistoricoPontosRepository;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.domain.model.HistoricoPontos;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PontosService {

    private final UserRepository userRepository;
    private final HistoricoPontosRepository historicoPontosRepository;

    @Transactional
    public void adicionarPontos(Long userId, int pontos, String motivo, String origemTipo, Long origemId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        user.setPontos(user.getPontos() + pontos);
        userRepository.save(user);

        historicoPontosRepository.save(HistoricoPontos.builder()
                .user(user)
                .pontos(pontos)
                .motivo(motivo)
                .origemTipo(origemTipo)
                .origemId(origemId)
                .build());
    }
}

