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
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ConexaoService {

    private final ConexaoRepository  conexaoRepository;
    private final UserRepository     userRepository;
    private final NotificationService notificationService;

    public List<Conexao> listarConexoes(Long userId) {
        return conexaoRepository.findConexoesAceitas(userId);
    }

    public List<Conexao> listarPendentes(Long userId) {
        return conexaoRepository.findPendentesRecebidas(userId);
    }

    public List<Conexao> listarEnviadas(Long userId) {
        return conexaoRepository.findEnviadasPendentes(userId);
    }

    @Transactional
    public Conexao solicitarConexao(Long solicitanteId, Long receptorId) {
        if (solicitanteId.equals(receptorId))
            throw new IllegalArgumentException("Você não pode se conectar consigo mesmo.");

        Optional<Conexao> existente = conexaoRepository.findEntreUsuarios(solicitanteId, receptorId);

        if (existente.isPresent()) {
            Conexao c = existente.get();
            // Se já são conexões aceitas, não permite nova solicitação
            if ("ACEITO".equals(c.getStatus())) {
                throw new IllegalStateException("Vocês já são conexões.");
            }
            // Remove o registro antigo (RECUSADO, PENDENTE, etc)
            conexaoRepository.delete(c);
            conexaoRepository.flush(); // 🔧 força a execução do DELETE no banco
        }

        User solicitante = userRepository.findById(solicitanteId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado."));
        User receptor = userRepository.findById(receptorId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário alvo não encontrado."));

        Conexao conexao = conexaoRepository.save(
                Conexao.builder().solicitante(solicitante).receptor(receptor).build()
        );

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

    @Transactional
    public void cancelarSolicitacao(Long solicitanteId, Long receptorId) {
        Conexao conexao = conexaoRepository
                .findBySolicitanteIdAndReceptorIdAndStatus(solicitanteId, receptorId, "PENDENTE")
                .orElseThrow(() -> new IllegalArgumentException("Solicitação pendente não encontrada."));
        conexaoRepository.delete(conexao);
    }

    public Long contarConexoes(Long userId) {
        return (long) conexaoRepository.findConexoesAceitas(userId).size();
    }
}