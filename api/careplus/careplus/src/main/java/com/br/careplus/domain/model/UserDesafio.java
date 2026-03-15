package com.br.careplus.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CP_USER_DESAFIOS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserDesafio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_DESAFIO_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DESAFIO_ID", nullable = false)
    private Desafio desafio;

    @Column(name = "INICIADO_EM", nullable = false, updatable = false)
    private LocalDateTime iniciadoEm;

    @Column(name = "CONCLUIDO_EM")
    private LocalDateTime concluidoEm;

    @Column(name = "PROGRESSO_ATUAL", columnDefinition = "NUMBER(10,2)")
    @Builder.Default
    private Double progressoAtual = 0.0;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "EM_ANDAMENTO";

    @Column(name = "PONTOS_GANHOS")
    @Builder.Default
    private Integer pontosGanhos = 0;

    @PrePersist
    protected void onCreate() {
        iniciadoEm = LocalDateTime.now();
    }
}
