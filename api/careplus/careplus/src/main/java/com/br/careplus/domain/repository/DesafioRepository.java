package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.Desafio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DesafioRepository extends JpaRepository<Desafio, Long> {

    @Query("SELECT d FROM Desafio d JOIN FETCH d.categoria WHERE d.ativo = true")
    List<Desafio> findByAtivoTrue();

    List<Desafio> findByCategoria_NomeAndAtivoTrue(String categoriaNome);
}