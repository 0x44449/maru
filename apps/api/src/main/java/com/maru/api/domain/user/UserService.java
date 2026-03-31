package com.maru.api.domain.user;

import com.maru.api.config.auth.RequestPayloadDto;
import com.maru.api.config.exception.WellKnownException;
import com.maru.api.domain.file.FileService;
import com.maru.api.domain.profile.ProfileRepository;
import com.maru.api.dto.UserDto;
import com.maru.api.entity.ProfileEntity;
import com.maru.api.entity.UserEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.regex.Pattern;

@Service
public class UserService {

    private static final Pattern USER_TAG_PATTERN = Pattern.compile("^[a-z0-9][a-z0-9_.]{3,11}$");

    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final FileService fileService;
    private final String minioEndpoint;
    private final String minioBucket;

    public UserService(UserRepository userRepository,
            ProfileRepository profileRepository,
            FileService fileService,
            @Value("${minio.endpoint}") String minioEndpoint,
            @Value("${minio.bucket}") String minioBucket) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.fileService = fileService;
        this.minioEndpoint = minioEndpoint;
        this.minioBucket = minioBucket;
    }

    @Transactional
    public UserDto register(RequestPayloadDto reqPayload, String name, String userTag, MultipartFile profileImage) {
        var email = reqPayload.jwt().getClaimAsString("email");

        if (userRepository.findByEmail(email).isPresent()) {
            throw new WellKnownException("USER_ALREADY_EXISTS", 200, "이미 등록된 사용자입니다.");
        }

        // 이름 검증
        if (name == null || name.isBlank()) {
            throw new WellKnownException("NAME_REQUIRED", 200, "이름을 입력해주세요.");
        }
        if (name.trim().length() > 20) {
            throw new WellKnownException("NAME_TOO_LONG", 200, "이름은 20자 이하로 입력해주세요.");
        }

        // 태그 검증
        if (userTag == null || userTag.isBlank()) {
            throw new WellKnownException("USER_TAG_REQUIRED", 200, "마루 ID를 입력해주세요.");
        }
        if (userTag.length() < 4) {
            throw new WellKnownException("USER_TAG_TOO_SHORT", 200, "마루 ID는 4자 이상이어야 합니다.");
        }
        if (userTag.length() > 12) {
            throw new WellKnownException("USER_TAG_TOO_LONG", 200, "마루 ID는 12자 이하여야 합니다.");
        }
        if (!USER_TAG_PATTERN.matcher(userTag).matches()) {
            throw new WellKnownException("USER_TAG_INVALID_FORMAT", 200, "마루 ID는 영문 소문자, 숫자, 밑줄, 마침표만 사용 가능합니다.");
        }
        if (userRepository.existsByUserTag(userTag)) {
            throw new WellKnownException("USER_TAG_ALREADY_EXISTS", 200, "이미 사용 중인 마루 ID입니다.");
        }

        var user = userRepository.insertUser(userTag, email, name);

        String avatarUrl = minioEndpoint + "/" + minioBucket + "/avatars/default/default_0.png";
        var profile = profileRepository.insertProfile(
                user.getUserId(),
                ProfileEntity.ProfileType.PERSONAL.toString(),
                name,
                avatarUrl
        );

        if (profileImage != null && !profileImage.isEmpty()) {
            var uploadResult = fileService.upload(profileImage, profile.getProfileId());
            avatarUrl = uploadResult.url();

            profile = ProfileEntity.builder()
                    .profileId(profile.getProfileId())
                    .userId(profile.getUserId())
                    .type(profile.getType())
                    .displayName(profile.getDisplayName())
                    .profileImageUrl(avatarUrl)
                    .statusMessage(profile.getStatusMessage())
                    .enabled(profile.getEnabled())
                    .createdAt(profile.getCreatedAt())
                    .updatedAt(profile.getUpdatedAt())
                    .build();
            profile = profileRepository.save(profile);
        }

        user = UserEntity.builder()
                .userId(user.getUserId())
                .userTag(userTag)
                .userTagChanged(true)
                .email(user.getEmail())
                .name(name)
                .lastActiveProfileId(profile.getProfileId())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
        user = userRepository.save(user);

        return UserDto.from(user, profile);
    }

    public record CheckTagResult(String userTag, String status) {
    }

    public void validateProfileOwnership(RequestPayloadDto reqPayload) {
        if (reqPayload.profileId() == null) {
            throw new WellKnownException("PROFILE_REQUIRED", 400, "프로필 선택이 필요합니다.");
        }
        var email = reqPayload.jwt().getClaimAsString("email");
        var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new WellKnownException("USER_NOT_FOUND", 404, "사용자를 찾을 수 없습니다."));
        var profiles = profileRepository.findByUserId(user.getUserId());
        boolean owned = profiles.stream()
                .anyMatch(p -> p.getProfileId().equals(reqPayload.profileId()));
        if (!owned) {
            throw new WellKnownException("PROFILE_ACCESS_DENIED", 403, "해당 프로필에 접근 권한이 없습니다.");
        }
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
}
