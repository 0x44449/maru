package com.maru.api.domain.file;

import com.maru.api.config.auth.Authenticated;
import com.maru.api.config.auth.CredentialPayload;
import com.maru.api.config.auth.RequestPayload;
import com.maru.api.config.exception.WellKnownException;
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

    public FileController(FileService fileService) {
        this.fileService = fileService;
    }

    @PostMapping("/upload")
    @Operation(summary = "파일 업로드", description = "이미지 파일을 업로드합니다. X-Profile-Id 헤더 필수.")
    public FileService.FileUploadResult upload(
            @RequestPayload CredentialPayload credential,
            @RequestParam("file") MultipartFile file) {
        if (credential.profileId() == null) {
            throw new WellKnownException("PROFILE_REQUIRED", 400, "프로필 선택이 필요합니다.");
        }
        return fileService.upload(file, credential.profileId());
    }
}
