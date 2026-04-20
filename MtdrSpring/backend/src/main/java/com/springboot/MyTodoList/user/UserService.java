package com.springboot.MyTodoList.user;

import com.springboot.MyTodoList.common.exception.ConflictException;
import com.springboot.MyTodoList.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getMe(Long userId) {
        User user = findActiveUserById(userId);
        return userMapper.toResponse(user);
    }

    @Transactional
    public UserResponse updateMe(Long userId, UserRequest request) {
        User user = findActiveUserById(userId);
        if (!user.getEmail().equals(request.getEmail()) &&
                userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        userRepository.save(user);
        return userMapper.toResponse(user);
    }

    @Transactional(readOnly = true)
    public UserSummary findByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .filter(User::isActive)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + email));
        return new UserSummary(user.getId(), user.getFullName(), user.getEmail());
    }

    public User findActiveUserById(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        if (!user.isActive()) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }
        return user;
    }

    @Transactional(readOnly = true)
    public User findByTelegramChatId(Long chatId) {
        return userRepository.findByTelegramChatId(chatId)
                .filter(User::isActive)
                .orElse(null);
    }

    @Transactional
    public void linkTelegramChatId(String email, String rawPassword, Long chatId) {
        User user = userRepository.findByEmail(email)
                .filter(User::isActive)
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        user.setTelegramChatId(chatId);
        userRepository.save(user);
    }
}
