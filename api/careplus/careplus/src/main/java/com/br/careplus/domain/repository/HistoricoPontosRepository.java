package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.HistoricoPontos;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HistoricoPontosRepository extends JpaRepository<HistoricoPontos, Long> {

    List<HistoricoPontos> findByUserIdOrderByCriadoEmDesc(Long userId);
}