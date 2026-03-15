package com.br.careplus.domain.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "CP_LIGAS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Liga {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "LIGA_ID")
    private Long id;

    @Column(name = "NOME", nullable = false, unique = true, length = 50)
    private String nome;

    @Column(name = "PONTOS_MINIMO", nullable = false)
    private Long pontosMinimo;

    @Column(name = "PONTOS_MAXIMO", nullable = false)
    private Long pontosMaximo;

    @Column(name = "COR_HEX", length = 7)
    private String corHex;

    @Column(name = "ICONE_URL", length = 500)
    private String iconeUrl;
}
