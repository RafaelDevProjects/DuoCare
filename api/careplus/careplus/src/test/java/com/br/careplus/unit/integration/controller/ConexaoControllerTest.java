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
class ConexaoControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;

    private String token;
    private Long userId;
    private static long counter = 0;

    @BeforeEach
    void setUp() {
        counter++;
        String email = String.format("conexao_%d@email.com", System.currentTimeMillis() + counter);
        User user = userRepository.save(User.builder()
                .nome("Conexao Teste")
                .email(email)
                .senhaHash("encoded")
                .build());
        userId = user.getId();
        token = jwtService.generateToken(user);
    }

    @Test
    void listarConexoes_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/conexoes")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void pendentes_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/conexoes/pendentes")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void enviadas_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/conexoes/enviadas")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void buscarUsuarios_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/conexoes/buscar?nome=Teste")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}