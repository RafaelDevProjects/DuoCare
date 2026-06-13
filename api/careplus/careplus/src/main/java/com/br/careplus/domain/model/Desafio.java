package com.br.careplus.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CP_DESAFIOS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Desafio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "DESAFIO_ID")
    private Long id;

    @Column(name = "TITULO", nullable = false, length = 150)
    private String titulo;

    @Column(name = "DESCRICAO", length = 500)
    private String descricao;

    @Column(name = "META_VALOR", nullable = false, columnDefinition = "NUMBER(10,2)")
    private Double metaValor;

    @Column(name = "META_UNIDADE", nullable = false, length = 20)
    private String metaUnidade;

    @Column(name = "PONTOS_RECOM", nullable = false)
    private Integer pontosRecompensa;

    @Column(name = "DURACAO_DIAS")
    @Builder.Default
    private Integer duracaoDias = 1;

    @Column(name = "NIVEL", length = 20)
    @Builder.Default
    private String nivel = "FACIL";

    @Column(name = "ATIVO")
    @Builder.Default
    private boolean ativo = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "CATEGORIA_ID")
    private CategoriaDesafio categoria;

    @Column(name = "DICAS", length = 500)
    private String dicas;
}
