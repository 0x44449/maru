package com.maru.api.domain.user;

import com.maru.api.config.auth.Authenticated;
import com.maru.api.config.auth.RequestPayload;
import com.maru.api.config.auth.RequestPayloadDto;
import com.maru.api.dto.ApiResult;
import com.maru.api.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User", description = "사용자 관련 API")
@Authenticated
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "사용자 등록", description = "신규 사용자를 등록합니다. 이름, 마루ID 필수. 프로필 이미지 선택.")
    public ApiResult<UserDto> register(@RequestPayload RequestPayloadDto payload,
                            @RequestParam("name") String name,
                            @RequestParam("userTag") String userTag,
                            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage) {
        return ApiResult.ok(userService.register(payload, name, userTag, profileImage));
    }

    @GetMapping("/check-tag")
    @Operation(summary = "사용자 태그 중복 검사", description = "사용자 태그 사용 가능 여부를 확인합니다.")
    public ApiResult<UserService.CheckTagResult> checkTag(@RequestParam("tag") String tag) {
        return ApiResult.ok(userService.checkTag(tag));
    }
}
