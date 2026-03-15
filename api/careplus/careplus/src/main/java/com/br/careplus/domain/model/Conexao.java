package com.br.careplus.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CP_CONEXOES")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Conexao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CONEXAO_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "SOLICITANTE_ID", nullable = false)
    private User solicitante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RECEPTOR_ID", nullable = false)
    private User receptor;

    @Column(name = "STATUS", length = 20)
    @Builder.Default
    private String status = "PENDENTE";

    @Column(name = "CRIADO_EM", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "ATUALIZADO_EM")
    private LocalDateTime atualizadoEm;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        atualizadoEm = LocalDateTime.now();
    }
}
