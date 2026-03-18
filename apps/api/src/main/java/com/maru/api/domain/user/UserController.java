package com.maru.api.domain.user;

import com.maru.api.config.auth.Authenticated;
import com.maru.api.config.auth.CredentialPayload;
import com.maru.api.config.auth.RequestPayload;
import com.maru.api.domain.user.dto.UpdateUserDto;
import com.maru.api.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User", description = "사용자 관련 API")
@Authenticated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/provision")
    @Operation(summary = "자동 프로비저닝", description = "로그인 직후 호출. 사용자가 없으면 자동 생성, 있으면 기존 정보 반환.")
    public UserDto provision(@RequestPayload CredentialPayload credential) {
        return userService.provision(credential);
    }

    @GetMapping("/me")
    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
    public UserDto getMe(@RequestPayload CredentialPayload credential) {
        return userService.getMe(credential);
    }

    @PatchMapping("/me")
    @Operation(summary = "프로필 설정", description = "사용자 태그, 이름, 프로필 이미지를 설정합니다.")
    public UserDto updateMe(@RequestPayload CredentialPayload credential,
                            @RequestBody UpdateUserDto dto) {
        return userService.updateMe(credential, dto);
    }

    @GetMapping("/check-tag")
    @Operation(summary = "사용자 태그 중복 검사", description = "사용자 태그 사용 가능 여부를 확인합니다.")
    public UserService.CheckTagResult checkTag(@RequestParam("tag") String tag) {
        return userService.checkTag(tag);
    }
}
