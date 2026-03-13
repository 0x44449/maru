package com.maru.api.config.exception;

import lombok.Getter;

@Getter
public class WellKnownException extends RuntimeException {

    private final String errorCode;
    private final int status;

    public WellKnownException(String errorCode, int status) {
        super("");
        this.errorCode = errorCode;
        this.status = status;
    }

    public WellKnownException(String errorCode, int status,  String message) {
        super(message);
        this.errorCode = errorCode;
        this.status = status;
    }
}
