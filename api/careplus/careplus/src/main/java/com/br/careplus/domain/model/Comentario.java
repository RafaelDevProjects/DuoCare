package com.br.careplus.domain.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CP_COMENTARIOS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COMENTARIO_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "POST_ID", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "CONTEUDO", nullable = false, length = 500)
    private String conteudo;

    @Column(name = "CRIADO_EM", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "ATIVO")
    @Builder.Default
    private boolean ativo = true;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }
}