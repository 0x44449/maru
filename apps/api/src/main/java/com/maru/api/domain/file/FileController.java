package com.maru.api.domain.file;

import com.maru.api.config.auth.Authenticated;
import com.maru.api.config.auth.RequestPayload;
import com.maru.api.config.auth.RequestPayloadDto;
import com.maru.api.domain.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/files")
@Tag(name = "File", description = "파일 관련 API")
@Authenticated
public class FileController {

    private final FileService fileService;
    private final UserService userService;

    public FileController(FileService fileService, UserService userService) {
        this.fileService = fileService;
        this.userService = userService;
    }

    @PostMapping("/upload")
    @Operation(summary = "파일 업로드", description = "이미지 파일을 업로드합니다. X-Profile-Id 헤더 필수.")
    public FileService.FileUploadResult upload(
            @RequestPayload RequestPayloadDto payload,
            @RequestParam("file") MultipartFile file) {
        userService.validateProfileOwnership(payload);
        return fileService.upload(file, payload.profileId());
    }
}
