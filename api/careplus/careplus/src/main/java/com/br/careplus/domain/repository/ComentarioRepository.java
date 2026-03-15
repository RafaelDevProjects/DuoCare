package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.Comentario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    @Query("SELECT c FROM Comentario c JOIN FETCH c.user WHERE c.post.id = :postId AND c.ativo = true ORDER BY c.criadoEm ASC")
    List<Comentario> findByPostId(@Param("postId") Long postId);

    long countByPostIdAndAtivoTrue(Long postId);
}