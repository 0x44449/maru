package com.maru.api.domain.user;

import com.maru.api.config.exception.WellKnownException;
import com.maru.api.domain.user.dto.RegisterUserDto;
import com.maru.api.dto.UserDto;
import com.maru.api.entity.UserEntity;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserDto getUserById(String userId) {
        var user = userRepository.findById(userId)
                .orElseThrow(() -> new WellKnownException("USER_NOT_FOUND", 404, "사용자를 찾을 수 없습니다."));

        return UserDto.from(user);
    }

    public UserDto registerUser(String userId, RegisterUserDto registerDto) {
        var exists = userRepository.findById(userId);
        if (exists.isPresent()) {
            throw new WellKnownException("USER_ALREADY_EXISTS", 400, "이미 존재하는 사용자입니다.");
        }

        var user = UserEntity.builder()
                .userId(userId)
                .email(registerDto.email())
                .name(registerDto.name())
                .build();
        var added = userRepository.insert(user);
        return UserDto.from(added);
    }
}
