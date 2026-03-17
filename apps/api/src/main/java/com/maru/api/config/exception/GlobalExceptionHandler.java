package com.maru.api.config.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WellKnownException.class)
    public ResponseEntity<ErrorResponse> handleWellKnown(WellKnownException e) {
        return ResponseEntity.status(e.getStatus())
                .body(new ErrorResponse(e.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler({AccessDeniedException.class, AuthenticationException.class})
    public ResponseEntity<ErrorResponse> handleAuth(Exception e) {
        return ResponseEntity.status(401)
                .body(new ErrorResponse("UNAUTHORIZED", "인증이 필요합니다"));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException e) {
        return ResponseEntity.status(500)
                .body(new ErrorResponse("UNHANDLED_ERROR", e.getMessage()));
    }
}
