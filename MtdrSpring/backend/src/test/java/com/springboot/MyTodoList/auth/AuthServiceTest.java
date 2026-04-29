package com.springboot.MyTodoList.auth;

import com.springboot.MyTodoList.TestFixtures;
import com.springboot.MyTodoList.common.exception.ConflictException;
import com.springboot.MyTodoList.config.JwtUtil;
import com.springboot.MyTodoList.user.User;
import com.springboot.MyTodoList.user.UserMapper;
import com.springboot.MyTodoList.user.UserRepository;
import com.springboot.MyTodoList.user.UserResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock UserMapper userMapper;
    @InjectMocks AuthService authService;

    @Test
    void register_withDuplicateEmail_throwsConflict() {
        given(userRepository.existsByEmail("dup@test.com")).willReturn(true);

        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test");
        req.setEmail("dup@test.com");
        req.setPassword("pass");

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email already in use");

        verify(userRepository, never()).save(any());
    }

    @Test
    void login_withWrongPassword_throwsBadCredentials() {
        User user = TestFixtures.user(1L);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("wrong", user.getPasswordHash())).willReturn(false);

        LoginRequest req = new LoginRequest();
        req.setEmail("user@test.com");
        req.setPassword("wrong");

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
    }

    @Test
    void login_withInactiveUser_throwsBadCredentials() {
        User inactive = TestFixtures.user(1L);
        inactive.setActive(false);
        given(userRepository.findByEmail("user@test.com")).willReturn(Optional.of(inactive));

        LoginRequest req = new LoginRequest();
        req.setEmail("user@test.com");
        req.setPassword("pass");

        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class)
                .hasMessageContaining("inactive");
    }

    @Test
    void login_success_returnsToken() {
        User user = TestFixtures.user(1L);
        given(userRepository.findByEmail("user1@test.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches(any(), any())).willReturn(true);
        given(jwtUtil.generateToken(1L)).willReturn("jwt-token");
        given(userMapper.toResponse(user)).willReturn(new UserResponse());

        LoginRequest req = new LoginRequest();
        req.setEmail("user1@test.com");
        req.setPassword("correctpass");

        AuthResponse response = authService.login(req);

        assertThat(response.getToken()).isEqualTo("jwt-token");
        verify(jwtUtil).generateToken(1L);
    }
}
