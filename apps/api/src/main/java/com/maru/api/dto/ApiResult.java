package com.maru.api.dto;

public record ApiResult<T>(
        boolean success,
        T data,
        String errorCode,
        String message
) {
    public static <T> ApiResult<T> ok(T data) {
        return new ApiResult<>(true, data, null, null);
    }

    public static <T> ApiResult<T> error(String errorCode, String message) {
        return new ApiResult<>(false, null, errorCode, message);
    }
}
