package com.br.careplus.domain.repository;

import com.br.careplus.domain.model.UserDesafio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserDesafioRepository extends JpaRepository<UserDesafio, Long> {

    @Query("SELECT ud FROM UserDesafio ud JOIN FETCH ud.desafio d JOIN FETCH d.categoria WHERE ud.user.id = :userId AND ud.status = :status")
    List<UserDesafio> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") String status);

    boolean existsByUserIdAndDesafioIdAndStatus(Long userId, Long desafioId, String status);

    @Query("SELECT ud FROM UserDesafio ud JOIN FETCH ud.desafio WHERE ud.user.id = :userId")
    List<UserDesafio> findByUserId(@Param("userId") Long userId);

    // ✅ Método que carrega o desafio com a categoria para evitar LazyInitializationException
    @Query("SELECT ud FROM UserDesafio ud JOIN FETCH ud.desafio d JOIN FETCH d.categoria WHERE ud.id = :id")
    Optional<UserDesafio> findByIdWithCategoria(@Param("id") Long id);

    @Query("SELECT ud FROM UserDesafio ud JOIN FETCH ud.desafio d JOIN FETCH d.categoria WHERE ud.user.id = :userId")
    List<UserDesafio> findAllByUserId(@Param("userId") Long userId);
}