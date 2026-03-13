package com.maru.api.config.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(WellKnownException.class)
    public ResponseEntity<ErrorResponse> handleWellKnown(WellKnownException e) {
        return ResponseEntity.status(e.getStatus())
                .body(new ErrorResponse(e.getErrorCode(), e.getMessage()));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntime(RuntimeException e) {
        return ResponseEntity.status(500)
                .body(new ErrorResponse("UNHANDLED_ERROR", e.getMessage()));
    }
}
