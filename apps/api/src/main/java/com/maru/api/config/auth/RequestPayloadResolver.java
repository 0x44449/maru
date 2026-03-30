package com.maru.api.config.auth;

import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.UUID;

@Component
public class RequestPayloadResolver implements HandlerMethodArgumentResolver {

    private static final String PROFILE_ID_HEADER = "X-Profile-Id";

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
        if (!parameter.hasParameterAnnotation(RequestPayload.class)) {
            return false;
        }
        Class<?> type = parameter.getParameterType();
        return type == RequestPayloadDto.class;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Class<?> type = parameter.getParameterType();

        if (type == RequestPayloadDto.class) {
            var jwt = getJwt();
            var profileId = getProfileId(webRequest);
            return new RequestPayloadDto(jwt, profileId);
        }

        return null;
    }

    private Jwt getJwt() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null) {
            return null;
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof Jwt jwt) {
            return jwt;
        }

        return null;
    }

    private UUID getProfileId(WebRequest webRequest) {
        String header = webRequest.getHeader(PROFILE_ID_HEADER);
        if (header == null || header.isBlank()) {
            return null;
        }

        try {
            return UUID.fromString(header);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
