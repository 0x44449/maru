package com.maru.api.domain.file;

import com.maru.api.config.exception.WellKnownException;
import com.maru.api.entity.FileEntity;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Service
public class FileService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final int THUMB_SIZE = 512;

    // 이미지 매직 바이트 시그니처
    private static final byte[] PNG_SIGNATURE = {(byte) 0x89, 0x50, 0x4E, 0x47};
    private static final byte[] JPEG_SIGNATURE = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] WEBP_RIFF = {0x52, 0x49, 0x46, 0x46};

    private final MinioClient minioClient;
    private final FileRepository fileRepository;
    private final String bucket;
    private final String endpoint;

    public FileService(MinioClient minioClient,
                       FileRepository fileRepository,
                       @Value("${minio.bucket}") String bucket,
                       @Value("${minio.endpoint}") String endpoint) {
        this.minioClient = minioClient;
        this.fileRepository = fileRepository;
        this.bucket = bucket;
        this.endpoint = endpoint;
    }

    public FileUploadResult upload(MultipartFile file, UUID uploaderId) {
        // 타입 검증
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new WellKnownException("INVALID_FILE_TYPE", 400, "허용되지 않은 파일 타입입니다.");
        }

        // 크기 검증
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new WellKnownException("FILE_TOO_LARGE", 400, "파일 크기가 5MB를 초과합니다.");
        }

        // 매직 바이트 검증
        validateMagicBytes(file, contentType);

        UUID fileId = UUID.randomUUID();
        String ext = getExtension(contentType);
        String basePath = "avatars/users/" + uploaderId + "/" + fileId;
        String originalPath = basePath + "." + ext;
        String thumbPath = basePath + "_thumb." + ext;

        // 원본 업로드
        uploadToMinio(file, originalPath, contentType);

        // 썸네일 생성 + 업로드
        generateAndUploadThumbnail(file, thumbPath, contentType);

        // DB 기록 (상대 경로 저장)
        var entity = FileEntity.builder()
                .uploaderId(uploaderId)
                .originalName(file.getOriginalFilename())
                .storedPath(originalPath)
                .contentType(contentType)
                .size(file.getSize())
                .build();
        var saved = fileRepository.save(entity);

        // 썸네일 URL 반환
        String thumbUrl = endpoint + "/" + bucket + "/" + thumbPath;
        return new FileUploadResult(saved.getFileId(), thumbUrl, contentType, file.getSize());
    }

    private void uploadToMinio(MultipartFile file, String objectPath, String contentType) {
        try (InputStream inputStream = file.getInputStream()) {
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(bucket)
                            .object(objectPath)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(contentType)
                            .build());
        } catch (Exception e) {
            throw new RuntimeException("파일 업로드 실패", e);
        }
    }

    private void generateAndUploadThumbnail(MultipartFile file, String thumbPath, String contentType) {
        try {
            var outputStream = new ByteArrayOutputStream();

            // 정사각형 크롭 + 512x512 리사이즈
            String outputFormat = contentType.equals("image/png") ? "png" : "jpg";
            Thumbnails.of(file.getInputStream())
                    .size(THUMB_SIZE, THUMB_SIZE)
                    .keepAspectRatio(true)
                    .outputFormat(outputFormat)
                    .toOutputStream(outputStream);

            byte[] thumbBytes = outputStream.toByteArray();
            String thumbContentType = outputFormat.equals("png") ? "image/png" : "image/jpeg";

            try (var inputStream = new ByteArrayInputStream(thumbBytes)) {
                minioClient.putObject(
                        PutObjectArgs.builder()
                                .bucket(bucket)
                                .object(thumbPath)
                                .stream(inputStream, thumbBytes.length, -1)
                                .contentType(thumbContentType)
                                .build());
            }
        } catch (Exception e) {
            throw new RuntimeException("썸네일 생성 실패", e);
        }
    }

    private void validateMagicBytes(MultipartFile file, String contentType) {
        try {
            byte[] header = new byte[12];
            try (InputStream is = file.getInputStream()) {
                int read = is.read(header);
                if (read < 4) {
                    throw new WellKnownException("INVALID_FILE_TYPE", 400, "파일 내용을 확인할 수 없습니다.");
                }
            }

            boolean valid = switch (contentType) {
                case "image/png" -> startsWith(header, PNG_SIGNATURE);
                case "image/jpeg" -> startsWith(header, JPEG_SIGNATURE);
                case "image/webp" -> startsWith(header, WEBP_RIFF);
                default -> false;
            };

            if (!valid) {
                throw new WellKnownException("INVALID_FILE_TYPE", 400, "파일 내용이 선언된 타입과 일치하지 않습니다.");
            }
        } catch (WellKnownException e) {
            throw e;
        } catch (Exception e) {
            throw new WellKnownException("INVALID_FILE_TYPE", 400, "파일 검증 중 오류가 발생했습니다.");
        }
    }

    private boolean startsWith(byte[] data, byte[] prefix) {
        if (data.length < prefix.length) return false;
        for (int i = 0; i < prefix.length; i++) {
            if (data[i] != prefix[i]) return false;
        }
        return true;
    }

    private String getExtension(String contentType) {
        return switch (contentType) {
            case "image/jpeg" -> "jpg";
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "bin";
        };
    }

    public record FileUploadResult(UUID fileId, String url, String contentType, long size) {}
}
