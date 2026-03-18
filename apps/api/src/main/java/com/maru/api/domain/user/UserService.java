package com.maru.api.domain.user;

import com.maru.api.config.auth.CredentialPayload;
import com.maru.api.config.exception.WellKnownException;
import com.maru.api.domain.profile.ProfileRepository;
import com.maru.api.domain.user.dto.UpdateUserDto;
import com.maru.api.dto.UserDto;
import com.maru.api.entity.ProfileEntity;
import com.maru.api.entity.UserEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern USER_TAG_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9_.]{3,11}$");
    private static final SecureRandom RANDOM = new SecureRandom();

    private static final String[] ADJECTIVES = {
            "졸린", "용감한", "수줍은", "배고픈", "느긋한", "씩씩한", "호기심많은", "엉뚱한",
            "반짝이는", "조용한", "활발한", "귀여운", "당당한", "명랑한", "겁없는"
    };
    private static final String[] NOUNS = {
            "고양이", "두부", "판다", "수달", "토끼", "구름", "별사탕", "감자",
            "호랑이", "펭귄", "다람쥐", "햄스터", "고래", "너구리", "해파리"
    };

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    public UserService(UserRepository userRepository, ProfileRepository profileRepository) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
    }

    @Transactional
    public UserDto provision(CredentialPayload credential) {
        // 기존 사용자 조회
        var existing = userRepository.findByAuthProviderAndAuthProviderId(
                credential.authProvider(), credential.authProviderId());
        if (existing.isPresent()) {
            return toUserDto(existing.get());
        }

        // 이름 결정
        String name = generateName();

        // user_tag 자동 생성
        String userTag = generateUserTag();

        // User 생성
        var user = UserEntity.builder()
                .authProvider(UserEntity.AuthProvider.valueOf(credential.authProvider()))
                .authProviderId(credential.authProviderId())
                .email(credential.email())
                .name(name)
                .userTag(userTag)
                .build();
        var savedUser = userRepository.save(user);

        // PERSONAL 프로필 자동 생성
        var profile = ProfileEntity.builder()
                .userId(savedUser.getUserId())
                .type(ProfileEntity.ProfileType.PERSONAL)
                .displayName(name)
                .build();
        var savedProfile = profileRepository.save(profile);

        // last_active_profile_id 설정
        savedUser = UserEntity.builder()
                .userId(savedUser.getUserId())
                .userTag(savedUser.getUserTag())
                .userTagChanged(savedUser.getUserTagChanged())
                .authProvider(savedUser.getAuthProvider())
                .authProviderId(savedUser.getAuthProviderId())
                .email(savedUser.getEmail())
                .name(savedUser.getName())
                .lastActiveProfileId(savedProfile.getProfileId())
                .createdAt(savedUser.getCreatedAt())
                .updatedAt(savedUser.getUpdatedAt())
                .build();
        savedUser = userRepository.save(savedUser);

        return UserDto.from(savedUser, savedProfile);
    }

    public UserDto getMe(CredentialPayload credential) {
        var user = userRepository.findByAuthProviderAndAuthProviderId(
                        credential.authProvider(), credential.authProviderId())
                .orElseThrow(() -> new WellKnownException("USER_NOT_FOUND", 404, "사용자를 찾을 수 없습니다."));
        return toUserDto(user);
    }

    @Transactional
    public UserDto updateMe(CredentialPayload credential, UpdateUserDto dto) {
        var user = userRepository.findByAuthProviderAndAuthProviderId(
                        credential.authProvider(), credential.authProviderId())
                .orElseThrow(() -> new WellKnownException("USER_NOT_FOUND", 404, "사용자를 찾을 수 없습니다."));

        var profile = profileRepository.findByUserIdAndType(user.getUserId(), ProfileEntity.ProfileType.PERSONAL)
                .orElseThrow();

        // userTag 변경
        if (dto.userTag() != null) {
            if (user.getUserTagChanged()) {
                throw new WellKnownException("USER_TAG_ALREADY_SET", 400, "사용자 태그는 1회만 변경할 수 있습니다.");
            }
            if (!USER_TAG_PATTERN.matcher(dto.userTag()).matches()) {
                throw new WellKnownException("INVALID_USER_TAG", 400, "사용자 태그 형식이 올바르지 않습니다.");
            }
            if (userRepository.existsByUserTag(dto.userTag())) {
                throw new WellKnownException("USER_TAG_ALREADY_EXISTS", 409, "이미 사용 중인 사용자 태그입니다.");
            }
            user = UserEntity.builder()
                    .userId(user.getUserId())
                    .userTag(dto.userTag())
                    .userTagChanged(true)
                    .authProvider(user.getAuthProvider())
                    .authProviderId(user.getAuthProviderId())
                    .email(user.getEmail())
                    .name(dto.name() != null ? dto.name() : user.getName())
                    .lastActiveProfileId(user.getLastActiveProfileId())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
        } else if (dto.name() != null) {
            user = UserEntity.builder()
                    .userId(user.getUserId())
                    .userTag(user.getUserTag())
                    .userTagChanged(user.getUserTagChanged())
                    .authProvider(user.getAuthProvider())
                    .authProviderId(user.getAuthProviderId())
                    .email(user.getEmail())
                    .name(dto.name())
                    .lastActiveProfileId(user.getLastActiveProfileId())
                    .createdAt(user.getCreatedAt())
                    .updatedAt(user.getUpdatedAt())
                    .build();
        }
        user = userRepository.save(user);

        // PERSONAL 프로필 업데이트
        if (dto.name() != null || dto.profileImage() != null) {
            profile = ProfileEntity.builder()
                    .profileId(profile.getProfileId())
                    .userId(profile.getUserId())
                    .type(profile.getType())
                    .displayName(dto.name() != null ? dto.name() : profile.getDisplayName())
                    .profileImageUrl(dto.profileImage() != null ? dto.profileImage() : profile.getProfileImageUrl())
                    .statusMessage(profile.getStatusMessage())
                    .enabled(profile.getEnabled())
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .build();
            profile = profileRepository.save(profile);
        }

        return UserDto.from(user, profile);
    }

    public record CheckTagResult(String userTag, String status) {}

    public CheckTagResult checkTag(String userTag) {
        if (!USER_TAG_PATTERN.matcher(userTag).matches()) {
            return new CheckTagResult(userTag, "INVALID_FORMAT");
        }
        if (userRepository.existsByUserTag(userTag)) {
            return new CheckTagResult(userTag, "ALREADY_TAKEN");
        }
        return new CheckTagResult(userTag, "AVAILABLE");
    }

    private UserDto toUserDto(UserEntity user) {
        var profile = profileRepository.findByUserIdAndType(user.getUserId(), ProfileEntity.ProfileType.PERSONAL)
                .orElse(null);
        return UserDto.from(user, profile);
    }

    private String generateName() {
        String adj = ADJECTIVES[RANDOM.nextInt(ADJECTIVES.length)];
        String noun = NOUNS[RANDOM.nextInt(NOUNS.length)];
        int num = RANDOM.nextInt(999) + 1;
        return adj + " " + noun + " " + num;
    }

    private String generateUserTag() {
        for (int i = 0; i < 10; i++) {
            String tag = "user_" + randomAlphaNumeric(7);
            if (!userRepository.existsByUserTag(tag)) {
                return tag;
            }
        }
        throw new RuntimeException("user_tag 생성 실패: 10회 시도 후에도 중복");
    }

    private String randomAlphaNumeric(int length) {
        String chars = "abcdefghijklmnopqrstuvwxyz0123456789";
        var sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(chars.charAt(RANDOM.nextInt(chars.length())));
        }
        return sb.toString();
    }
}
