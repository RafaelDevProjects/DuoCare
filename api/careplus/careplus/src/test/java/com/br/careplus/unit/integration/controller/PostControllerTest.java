package com.br.careplus.integration.controller;

import com.br.careplus.api.dto.post.PostRequest;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class PostControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JwtService jwtService;
    @Autowired private UserRepository userRepository;
    @Autowired private ObjectMapper objectMapper;

    private String token;
    private Long userId;

    @BeforeEach
    void setUp() {
        String email = String.format("post_%d@email.com", System.currentTimeMillis());
        User user = userRepository.save(User.builder()
                .nome("Post Teste")
                .email(email)
                .senhaHash("encoded")
                .build());
        userId = user.getId();
        token = jwtService.generateToken(user);
    }

    @Test
    void feedGlobal_autenticado_deveRetornar200() throws Exception {
        mockMvc.perform(get("/api/posts/global")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }

    @Test
    void criarPost_autenticado_deveRetornar200() throws Exception {
        PostRequest request = new PostRequest("Conteúdo do post", null, null, null);
        mockMvc.perform(post("/api/posts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.conteudo").value("Conteúdo do post"))
                .andExpect(jsonPath("$.userId").value(userId));
    }

    @Test
    void curtirPost_postInexistente_deveRetornarBadRequest() throws Exception {
        mockMvc.perform(post("/api/posts/999/curtir")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isBadRequest());
    }
}