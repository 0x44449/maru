package com.maru.api.domain.user.dto;

public record UpdateUserDto(
        String userTag,
        String name,
        String profileImage
) {}
