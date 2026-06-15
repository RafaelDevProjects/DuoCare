package com.br.careplus.unit.service;

import com.br.careplus.api.dto.auth.LoginRequest;
import com.br.careplus.api.dto.auth.RegisterRequest;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.domain.service.AuthService;
import com.br.careplus.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;

    @InjectMocks private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User user;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest("João Silva", "joao@email.com", "senha123");
        loginRequest = new LoginRequest("joao@email.com", "senha123");
        user = User.builder()
                .id(1L)
                .nome("João Silva")
                .email("joao@email.com")
                .senhaHash("encoded")
                .pontos(0L)
                .build();
    }

    @Test
    void register_deveCriarUsuarioComSucesso() {
        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(false);
        when(passwordEncoder.encode(registerRequest.senha())).thenReturn("encoded");
        when(userRepository.save(any(User.class))).thenReturn(user);

        var response = authService.register(registerRequest);

        assertThat(response.nome()).isEqualTo("João Silva");
        assertThat(response.email()).isEqualTo("joao@email.com");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void register_deveLancarExcecaoQuandoEmailJaExiste() {
        when(userRepository.existsByEmail(registerRequest.email())).thenReturn(true);

        assertThatThrownBy(() -> authService.register(registerRequest))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("E-mail já cadastrado.");
    }

    @Test
    void login_deveRetornarTokenComSucesso() {
        when(authenticationManager.authenticate(any())).thenReturn(null);
        when(userRepository.findByEmail(loginRequest.email())).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn("fake-jwt-token");

        var response = authService.login(loginRequest);

        assertThat(response.token()).isEqualTo("fake-jwt-token");
        assertThat(response.userId()).isEqualTo(1L);
    }

    @Test
    void login_deveLancarExcecaoQuandoCredenciaisInvalidas() {
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        assertThatThrownBy(() -> authService.login(loginRequest))
                .isInstanceOf(BadCredentialsException.class);
    }
}