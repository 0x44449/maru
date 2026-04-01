package com.maru.api.config.exception;

import com.maru.api.dto.ApiResult;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WellKnownException.class)
    public ApiResult<Void> handleWellKnown(WellKnownException e) {
        log.warn("[WellKnown] {} - {}", e.getErrorCode(), e.getMessage());
        return ApiResult.error(e.getErrorCode(), e.getMessage());
    }

    @ExceptionHandler({AccessDeniedException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponse> handleAuth(Exception e) {
        log.warn("[Auth] {}", e.getMessage());
        return ResponseEntity.status(401)
                .body(new ErrorResponse("UNAUTHORIZED", "인증이 필요합니다"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException e) {
        log.error("[Runtime] 처리되지 않은 예외", e);
        return ResponseEntity.status(500)
                .body(new ErrorResponse("UNHANDLED_ERROR", e.getMessage()));
    }
}
