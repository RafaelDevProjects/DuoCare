package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.Liga;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LigaRepository extends JpaRepository<Liga, Long> {

    @Query("SELECT l FROM Liga l WHERE :pontos BETWEEN l.pontosMinimo AND l.pontosMaximo")
    Optional<Liga> findByPontos(@Param("pontos") Long pontos);
}
