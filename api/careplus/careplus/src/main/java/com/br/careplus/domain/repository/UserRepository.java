package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Busca usuários por nome (para tela de conexões)
    @Query("SELECT u FROM User u WHERE LOWER(u.nome) LIKE LOWER(CONCAT('%', :nome, '%')) AND u.ativo = true")
    List<User> searchByNome(@Param("nome") String nome);

    // Top N do ranking global
    @Query("SELECT u FROM User u WHERE u.ativo = true ORDER BY u.pontos DESC")
    List<User> findTopByPontos();
}
