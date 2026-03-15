package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.Curtida;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CurtidaRepository extends JpaRepository<Curtida, Long> {

    Optional<Curtida> findByPostIdAndUserId(Long postId, Long userId);

    long countByPostId(Long postId);

    boolean existsByPostIdAndUserId(Long postId, Long userId);
}