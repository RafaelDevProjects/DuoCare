package com.br.careplus.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name = "CP_USERS")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "USER_ID")
    private Long id;

    @Column(name = "NOME", nullable = false, length = 100)
    private String nome;

    @Column(name = "EMAIL", nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "SENHA_HASH", nullable = false)
    private String senhaHash;

    @Lob
    @Column(name = "FOTO_URL", columnDefinition = "CLOB")
    private String fotoUrl;

    @Column(name = "BIO", length = 300)
    private String bio;

    @Column(name = "PONTOS", nullable = false)
    @Builder.Default
    private Long pontos = 0L;

    @Column(name = "CRIADO_EM", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @Column(name = "ATIVO", nullable = false)
    @Builder.Default
    private boolean ativo = true;

    @PrePersist
    protected void onCreate() {
        criadoEm = LocalDateTime.now();
    }

    // --- UserDetails ---
    @Override public Collection<? extends GrantedAuthority> getAuthorities() { return List.of(); }
    @Override public String getPassword()  { return senhaHash; }
    @Override public String getUsername()  { return email; }
    @Override public boolean isEnabled()   { return ativo; }
}
