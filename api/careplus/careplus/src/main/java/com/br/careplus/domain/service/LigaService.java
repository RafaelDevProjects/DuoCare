package com.br.careplus.domain.service;

import com.br.careplus.api.dto.liga.LigaResponse;
import com.br.careplus.api.dto.liga.RankingItemResponse;
import com.br.careplus.domain.model.Liga;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.LigaRepository;
import com.br.careplus.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LigaService {

    private final LigaRepository ligaRepository;
    private final UserRepository userRepository;

    public LigaResponse minhaLiga(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));

        Liga liga = ligaRepository.findByPontos(user.getPontos())
                .orElseThrow(() -> new IllegalStateException("Liga não encontrada para os pontos do usuário."));

        return LigaResponse.from(user, liga);
    }

    public List<RankingItemResponse> ranking(int limite) {
        List<User> usuarios = userRepository.findTopByPontos()
                .stream().limit(limite).toList();

        List<RankingItemResponse> ranking = new ArrayList<>();
        for (int i = 0; i < usuarios.size(); i++) {
            User user = usuarios.get(i);
            Liga liga = ligaRepository.findByPontos(user.getPontos()).orElse(null);
            ranking.add(RankingItemResponse.from(i + 1, user, liga));
        }
        return ranking;
    }

    public List<Liga> listarTodasLigas() {
        return ligaRepository.findAll();
    }
}