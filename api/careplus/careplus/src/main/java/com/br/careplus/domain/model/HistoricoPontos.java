package com.br.careplus.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CP_HISTORICO_PONTOS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class HistoricoPontos {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "HISTORICO_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "PONTOS", nullable = false)
    private Integer pontos;

    @Column(name = "MOTIVO", nullable = false, length = 200)
    private String motivo;

    @Column(name = "ORIGEM_TIPO", length = 30)
    private String origemTipo;

    @Column(name = "ORIGEM_ID")
    private Long origemId;

    @Column(name = "CRIADO_EM", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}