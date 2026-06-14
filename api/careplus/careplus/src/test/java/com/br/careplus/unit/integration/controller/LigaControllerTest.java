package com.br.careplus.integration.controller;

import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class LigaControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;

    private String token;

    @BeforeEach
    void setUp() {
        String email = String.format("liga_%d@email.com", System.currentTimeMillis());
        User user = userRepository.save(User.builder()
                .nome("Liga Teste")
                .email(email)
                .senhaHash("encoded")
                .pontos(500L)
                .build());
        token = jwtService.generateToken(user);
    }

    @Test
    void minhaLiga_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/liga/minha")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.ligaNome").exists());
    }

    @Test
    void ranking_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/liga/ranking")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void ranking_semToken_deveRetornar403() throws Exception {
        // API retorna 403 (Forbidden) quando não há token, não 401
        mockMvc.perform(get("/api/liga/ranking"))
                .andExpect(status().isForbidden());
    }
}