package com.maru.api.domain.auth;

import com.maru.api.config.auth.Authenticated;
import com.maru.api.config.auth.RequestPayload;
import com.maru.api.config.auth.RequestPayloadDto;
import com.maru.api.domain.auth.dto.LoginRequestDto;
import com.maru.api.dto.ApiResult;
import com.maru.api.dto.UserDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Auth", description = "인증 관련 API")
@Authenticated
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "사용자 존재 확인 및 기기 등록. 미등록 사용자는 USER_NOT_REGISTERED 에러 반환.")
    public ApiResult<UserDto> login(@RequestPayload RequestPayloadDto payload,
                                    @RequestBody LoginRequestDto dto) {
        return ApiResult.ok(authService.login(payload, dto));
    }
}
