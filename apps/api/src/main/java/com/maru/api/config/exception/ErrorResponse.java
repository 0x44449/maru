package com.maru.api.config.exception;

public record ErrorResponse(
        String errorCode,
        String message
) {}
