package com.br.careplus.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CP_CATEGORIAS_DESAFIO")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoriaDesafio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CATEGORIA_ID")
    private Long id;

    @Column(name = "NOME", nullable = false, length = 50)
    private String nome;

    @Column(name = "DESCRICAO", length = 200)
    private String descricao;

    @Column(name = "ICONE_URL", length = 500)
    private String iconeUrl;
}