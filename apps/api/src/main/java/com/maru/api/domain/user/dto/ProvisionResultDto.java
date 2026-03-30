package com.maru.api.domain.user.dto;

import com.maru.api.dto.UserDto;

public record ProvisionResultDto(
        UserDto user,
        Status status
) {
    public enum Status {
        PROVISIONED, EXISTING
    }
}
