package com.maru.api.domain.user;

import com.maru.api.config.auth.AllowPublic;
import com.maru.api.config.auth.Authenticated;
import com.maru.api.config.auth.JwtPayload;
import com.maru.api.config.auth.RequestPayload;
import com.maru.api.domain.user.dto.RegisterUserDto;
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

    @GetMapping("/me")
    @Operation(summary = "내 정보 조회", description = "현재 로그인한 사용자의 정보를 조회합니다.")
    @AllowPublic
    public UserDto getMe(@RequestPayload JwtPayload jwt) {
        var uid = jwt.sub();
        return userService.getUserById(uid);
    }

    @PostMapping("/register")
    @Operation(summary = "사용자 등록", description = "새로운 사용자를 등록합니다.")
    public UserDto register(@RequestBody RegisterUserDto registerDto) {
        return null;
    }
}
