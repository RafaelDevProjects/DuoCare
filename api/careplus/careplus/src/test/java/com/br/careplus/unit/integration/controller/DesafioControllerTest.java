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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class DesafioControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;

    private String token;

    @BeforeEach
    void setUp() {
        String email = String.format("desafio_%d@email.com", System.currentTimeMillis());
        User user = userRepository.save(User.builder()
                .nome("Teste Desafio")
                .email(email)
                .senhaHash("encoded")
                .build());
        token = jwtService.generateToken(user);
    }

    @Test
    void listarDesafios_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/desafios")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void listarDesafios_semToken_deveRetornar403() throws Exception {
        // API retorna 403 (Forbidden) quando não há token, não 401
        mockMvc.perform(get("/api/desafios"))
                .andExpect(status().isForbidden());
    }

    @Test
    void meusDesafios_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/desafios/meus")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}