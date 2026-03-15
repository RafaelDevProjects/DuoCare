package com.br.careplus.domain.model;


import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "CP_POSTS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POST_ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "USER_ID", nullable = false)
    private User user;

    @Column(name = "CONTEUDO", nullable = false, length = 1000)
    private String conteudo;

    @Column(name = "MIDIA_URL", length = 500)
    private String midiaUrl;

    @Column(name = "TIPO_MIDIA", length = 10)
    private String tipoMidia;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "DESAFIO_REF")
    private Desafio desafioRef;

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