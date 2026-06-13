package com.br.careplus.domain.service;

import com.br.careplus.api.dto.desafio.UserDesafioResponse;
import com.br.careplus.api.dto.notification.NotificationDTO;
import com.br.careplus.domain.model.*;
import com.br.careplus.domain.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DesafioService {

    private final DesafioRepository      desafioRepository;
    private final UserDesafioRepository  userDesafioRepository;
    private final UserRepository         userRepository;
    private final PontosService          pontosService;
    private final NotificationService    notificationService;

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

        UserDesafio userDesafio = UserDesafio.builder()
                .user(user)
                .desafio(desafio)
                .build();

        UserDesafio salvo = userDesafioRepository.save(userDesafio);

        // Recarrega com a categoria carregada para evitar LazyInitializationException
        return userDesafioRepository.findByIdWithCategoria(salvo.getId())
                .orElseThrow(() -> new IllegalArgumentException("Erro ao carregar desafio iniciado"));
    }

    public List<UserDesafio> listarTodosDesafiosDoUsuario(Long userId) {
        return userDesafioRepository.findAllByUserId(userId);
    }

    @Transactional
    public UserDesafio atualizarProgresso(Long userId, Long userDesafioId, Double novoProgresso) {
        // Usa o método que carrega a categoria junto
        UserDesafio ud = userDesafioRepository.findByIdWithCategoria(userDesafioId)
                .orElseThrow(() -> new IllegalArgumentException("Registro não encontrado."));

        if (!ud.getUser().getId().equals(userId))
            throw new SecurityException("Acesso negado.");

        ud.setProgressoAtual(novoProgresso);
        UserDesafio salvo = userDesafioRepository.save(ud);

        // ✅ Só concede pontos se a meta foi atingida (100%)
        if (novoProgresso >= ud.getDesafio().getMetaValor()) {
            ud.setStatus("CONCLUIDO");
            ud.setConcluidoEm(LocalDateTime.now());
            int pontos = ud.getDesafio().getPontosRecompensa();
            ud.setPontosGanhos(pontos);

            pontosService.adicionarPontos(userId, pontos,
                    "Desafio concluído: " + ud.getDesafio().getTitulo(),
                    "DESAFIO", ud.getDesafio().getId());

            salvo = userDesafioRepository.save(ud);

            // ✅ WebSocket: notifica o usuário sobre a conclusão em tempo real
            notificationService.notificarDesafio(
                    userId,
                    NotificationDTO.desafioConcluido(UserDesafioResponse.from(salvo), pontos)
            );
        }



        return salvo;
    }
}