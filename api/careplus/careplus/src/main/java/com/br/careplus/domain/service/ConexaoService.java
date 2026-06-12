package com.br.careplus.domain.service;

import com.br.careplus.api.dto.conexao.ConexaoResponse;
import com.br.careplus.api.dto.notification.NotificationDTO;
import com.br.careplus.domain.model.Conexao;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.ConexaoRepository;
import com.br.careplus.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConexaoService {

    private final ConexaoRepository  conexaoRepository;
    private final UserRepository     userRepository;
    private final NotificationService notificationService; // ✅ novo

    public List<Conexao> listarConexoes(Long userId) {
        return conexaoRepository.findConexoesAceitas(userId);
    }

    public List<Conexao> listarPendentes(Long userId) {
        return conexaoRepository.findPendentesRecebidas(userId);
    }

    @Transactional
    public Conexao solicitarConexao(Long solicitanteId, Long receptorId) {
        if (solicitanteId.equals(receptorId))
            throw new IllegalArgumentException("Você não pode se conectar consigo mesmo.");

        conexaoRepository.findEntreUsuarios(solicitanteId, receptorId).ifPresent(c -> {
            throw new IllegalStateException("Já existe uma conexão ou solicitação entre vocês.");
        });

        User solicitante = userRepository.findById(solicitanteId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        User receptor = userRepository.findById(receptorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário alvo não encontrado."));

        Conexao conexao = conexaoRepository.save(
                Conexao.builder().solicitante(solicitante).receptor(receptor).build()
        );

        // ✅ WebSocket: avisa o receptor em tempo real sobre a nova solicitação
        ConexaoResponse responseParaReceptor = ConexaoResponse.from(conexao, receptorId);
        notificationService.notificarConexao(
                receptorId,
                NotificationDTO.novaSolicitacao(responseParaReceptor, solicitante.getNome())
        );

        return conexao;
    }

    @Transactional
    public Conexao responderSolicitacao(Long conexaoId, Long userId, boolean aceitar) {
        Conexao conexao = conexaoRepository.findByIdComUsuarios(conexaoId)
                .orElseThrow(() -> new IllegalArgumentException("Solicitação não encontrada."));

        if (!conexao.getReceptor().getId().equals(userId))
            throw new SecurityException("Acesso negado.");

        if (!"PENDENTE".equals(conexao.getStatus()))
            throw new IllegalStateException("Solicitação já foi respondida.");

        conexao.setStatus(aceitar ? "ACEITO" : "RECUSADO");
        Conexao salva = conexaoRepository.save(conexao);

        // ✅ WebSocket: se aceito, avisa o solicitante em tempo real
        if (aceitar) {
            Long solicitanteId = conexao.getSolicitante().getId();
            ConexaoResponse responseParaSolicitante = ConexaoResponse.from(salva, solicitanteId);
            notificationService.notificarConexao(
                    solicitanteId,
                    NotificationDTO.conexaoAceita(responseParaSolicitante, conexao.getReceptor().getNome())
            );
        }

        return salva;
    }

    @Transactional
    public void removerConexao(Long conexaoId, Long userId) {
        Conexao conexao = conexaoRepository.findById(conexaoId)
                .orElseThrow(() -> new IllegalArgumentException("Conexão não encontrada."));

        boolean envolvido = conexao.getSolicitante().getId().equals(userId)
                || conexao.getReceptor().getId().equals(userId);

        if (!envolvido) throw new SecurityException("Acesso negado.");

        conexaoRepository.delete(conexao);
    }

    public List<User> buscarUsuarios(String nome) {
        return userRepository.searchByNome(nome);
    }
}