package com.maru.api.domain.user;

import com.maru.api.config.auth.RequestPayloadDto;
import com.maru.api.config.exception.WellKnownException;
import com.maru.api.domain.profile.ProfileRepository;
import com.maru.api.domain.user.dto.ProvisionResultDto;
import com.maru.api.domain.user.dto.UpdateUserDto;
import com.maru.api.dto.UserDto;
import com.maru.api.entity.ProfileEntity;
import com.maru.api.entity.UserEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;
import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern USER_TAG_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9_.]{3,11}$");

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final String minioEndpoint;
    private final String minioBucket;

    public UserService(UserRepository userRepository,
            ProfileRepository profileRepository,
            @Value("${minio.endpoint}") String minioEndpoint,
            @Value("${minio.bucket}") String minioBucket) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.minioEndpoint = minioEndpoint;
        this.minioBucket = minioBucket;
    }

    @Transactional
    public ProvisionResultDto provision(RequestPayloadDto reqPayload) {
        var email = reqPayload.jwt().getClaimAsString("email");
        var existing = userRepository.findByEmail(email);
        if (existing.isPresent()) {
            return new ProvisionResultDto(toUserDto(existing.get()), ProvisionResultDto.Status.EXISTING);
        }

        String userTag = null;
        for (int i = 0; i < 10; i++) {
            userTag = UserUtil.generateUserTag("user_", 7);
            if (!userRepository.existsByUserTag(userTag)) {
                break;
            }
            userTag = null;
        }
        if (userTag == null) {
            throw new WellKnownException("USER_TAG_GENERATION_FAILED", 500, "user_tag 생성에 실패했습니다.");
        }
        String nickname = UserUtil.generateNickname();
        String avatarUrl = minioEndpoint + "/" + minioBucket + "/avatars/default/default_0.png";

        var insertedUser = userRepository.insertUser(userTag, email, nickname);

        var insertedProfile = profileRepository.insertProfile(
                insertedUser.getUserId(),
                ProfileEntity.ProfileType.PERSONAL.toString(),
                nickname,
                avatarUrl
        );

        insertedUser = rebuildUser(insertedUser, insertedUser.getName(), insertedUser.getUserTag(),
                insertedUser.getUserTagChanged(), insertedProfile.getProfileId());
        insertedUser = userRepository.save(insertedUser);

        return new ProvisionResultDto(UserDto.from(insertedUser, insertedProfile), ProvisionResultDto.Status.PROVISIONED);
    }

    public UserDto getMe(RequestPayloadDto reqPayload) {
        var user = findUserByJwt(reqPayload);
        return toUserDto(user);
    }

    @Transactional
    public UserDto updateMe(RequestPayloadDto reqPayload, UpdateUserDto dto) {
        var user = findUserByJwt(reqPayload);
        var profile = profileRepository.findByUserIdAndType(user.getUserId(), ProfileEntity.ProfileType.PERSONAL)
                .orElseThrow();

        String newName = dto.name() != null ? dto.name() : user.getName();
        String newUserTag = user.getUserTag();
        boolean newUserTagChanged = user.getUserTagChanged();

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
            newUserTag = dto.userTag();
            newUserTagChanged = true;
        }

        user = rebuildUser(user, newName, newUserTag, newUserTagChanged, user.getLastActiveProfileId());
        user = userRepository.save(user);

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

    public record CheckTagResult(String userTag, String status) {
    }

    public CheckTagResult checkTag(String userTag) {
        if (!USER_TAG_PATTERN.matcher(userTag).matches()) {
            return new CheckTagResult(userTag, "INVALID_FORMAT");
        }
        if (userRepository.existsByUserTag(userTag)) {
            return new CheckTagResult(userTag, "ALREADY_TAKEN");
        }
        return new CheckTagResult(userTag, "AVAILABLE");
    }

    public void validateProfileOwnership(RequestPayloadDto reqPayload) {
        if (reqPayload.profileId() == null) {
            throw new WellKnownException("PROFILE_REQUIRED", 400, "프로필 선택이 필요합니다.");
        }
        var user = findUserByJwt(reqPayload);
        var profiles = profileRepository.findByUserId(user.getUserId());
        boolean owned = profiles.stream()
                .anyMatch(p -> p.getProfileId().equals(reqPayload.profileId()));
        if (!owned) {
            throw new WellKnownException("PROFILE_ACCESS_DENIED", 403, "해당 프로필에 접근 권한이 없습니다.");
        }
    }

    private UserEntity findUserByJwt(RequestPayloadDto reqPayload) {
        var email = reqPayload.jwt().getClaimAsString("email");
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new WellKnownException("USER_NOT_FOUND", 404, "사용자를 찾을 수 없습니다."));
    }

    private UserDto toUserDto(UserEntity user) {
        var profile = profileRepository.findByUserIdAndType(user.getUserId(), ProfileEntity.ProfileType.PERSONAL)
                .orElse(null);
        return UserDto.from(user, profile);
    }

    private UserEntity rebuildUser(UserEntity source, String name, String userTag,
            boolean userTagChanged, UUID lastActiveProfileId) {
        return UserEntity.builder()
                .userId(source.getUserId())
                .userTag(userTag)
                .userTagChanged(userTagChanged)
                .email(source.getEmail())
                .name(name)
                .lastActiveProfileId(lastActiveProfileId)
                .createdAt(source.getCreatedAt())
                .updatedAt(source.getUpdatedAt())
                .build();
    }
}
