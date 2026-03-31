package com.maru.api.domain.auth;

import com.maru.api.config.auth.RequestPayloadDto;
import com.maru.api.config.exception.WellKnownException;
import com.maru.api.domain.auth.dto.LoginRequestDto;
import com.maru.api.domain.profile.ProfileRepository;
import com.maru.api.domain.user.UserRepository;
import com.maru.api.dto.UserDto;
import com.maru.api.entity.ProfileEntity;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public AuthService(UserRepository userRepository, ProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    public UserDto login(RequestPayloadDto reqPayload, LoginRequestDto dto) {
        var email = reqPayload.jwt().getClaimAsString("email");
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new WellKnownException("USER_NOT_REGISTERED", 200, "등록되지 않은 사용자입니다."));

        // TODO: FCM 기기 토큰 저장 (dto.fcmToken())

        var profile = profileRepository.findByUserIdAndType(user.getUserId(), ProfileEntity.ProfileType.PERSONAL)
                .orElse(null);

        return UserDto.from(user, profile);
    }
}
