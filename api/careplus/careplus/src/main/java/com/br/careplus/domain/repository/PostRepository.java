package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface PostRepository extends JpaRepository<Post, Long> {

    // Feed global paginado
    @Query("""
        SELECT p FROM Post p
        JOIN FETCH p.user
        WHERE p.ativo = true
        ORDER BY p.criadoEm DESC
        """)
    Page<Post> findFeedGlobal(Pageable pageable);

    // Feed apenas de conexões do usuário
    @Query("""
        SELECT p FROM Post p
        JOIN FETCH p.user u
        WHERE p.ativo = true
        AND (u.id = :userId OR u.id IN (
            SELECT CASE
                WHEN c.solicitante.id = :userId THEN c.receptor.id
                ELSE c.solicitante.id
            END
            FROM Conexao c
            WHERE (c.solicitante.id = :userId OR c.receptor.id = :userId)
            AND c.status = 'ACEITO'
        ))
        ORDER BY p.criadoEm DESC
        """)
    Page<Post> findFeedConexoes(@Param("userId") Long userId, Pageable pageable);
}
