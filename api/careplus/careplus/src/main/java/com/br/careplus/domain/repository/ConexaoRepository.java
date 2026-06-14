package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.Conexao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConexaoRepository extends JpaRepository<Conexao, Long> {

    @Query("""
        SELECT c FROM Conexao c
        JOIN FETCH c.solicitante
        JOIN FETCH c.receptor
        WHERE (c.solicitante.id = :userId OR c.receptor.id = :userId)
        AND c.status = 'ACEITO'
        """)
    List<Conexao> findConexoesAceitas(@Param("userId") Long userId);

    @Query("""
        SELECT c FROM Conexao c
        JOIN FETCH c.solicitante
        WHERE c.receptor.id = :userId AND c.status = 'PENDENTE'
        """)
    List<Conexao> findPendentesRecebidas(@Param("userId") Long userId);

    // 🆕 Solicitações enviadas pendentes
    @Query("""
        SELECT c FROM Conexao c
        JOIN FETCH c.receptor
        WHERE c.solicitante.id = :userId AND c.status = 'PENDENTE'
        """)
    List<Conexao> findEnviadasPendentes(@Param("userId") Long userId);

    @Query("""
        SELECT c FROM Conexao c
        WHERE (c.solicitante.id = :userId1 AND c.receptor.id = :userId2)
        OR (c.solicitante.id = :userId2 AND c.receptor.id = :userId1)
        """)
    Optional<Conexao> findEntreUsuarios(@Param("userId1") Long userId1, @Param("userId2") Long userId2);

    @Query("""
        SELECT c FROM Conexao c
        JOIN FETCH c.solicitante
        JOIN FETCH c.receptor
        WHERE c.id = :id
        """)
    Optional<Conexao> findByIdComUsuarios(@Param("id") Long id);

    Optional<Conexao> findBySolicitanteIdAndReceptorIdAndStatus(Long solicitanteId, Long receptorId, String status);

    @Query("SELECT COUNT(c) FROM Conexao c WHERE (c.solicitante.id = :userId OR c.receptor.id = :userId) AND c.status = 'ACEITO'")
    Long countConexoesAceitas(@Param("userId") Long userId);
}