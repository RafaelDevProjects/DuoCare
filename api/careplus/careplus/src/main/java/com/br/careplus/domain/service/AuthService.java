package com.br.careplus.domain.service;

import com.br.careplus.api.dto.auth.*;
import com.br.careplus.api.dto.user.UserResponse;
import com.br.careplus.domain.model.User;
import com.br.careplus.domain.repository.UserRepository;
import com.br.careplus.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("E-mail já cadastrado.");
        }
        User user = User.builder()
                .nome(request.nome())
                .email(request.email())
                .senhaHash(passwordEncoder.encode(request.senha()))
                .build();
        user = userRepository.save(user);
        return toResponse(user);
    }

    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.senha())
        );
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Usuário não encontrado."));
        String token = jwtService.generateToken(user);
        return new LoginResponse(token, user.getId(), user.getNome(), user.getPontos());
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(u.getId(), u.getNome(), u.getEmail(),
                u.getFotoUrl(), u.getBio(), u.getPontos(), u.getCriadoEm());
    }
}
