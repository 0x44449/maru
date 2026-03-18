package com.maru.api.config.auth;

import com.maru.api.config.exception.WellKnownException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.Map;
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
        return type == CredentialPayload.class || type == JwtPayload.class;
    }

    @Override
    public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        Jwt jwt = getJwtFromSecurityContext();
        if (jwt == null) {
            return null;
        }

        Class<?> type = parameter.getParameterType();
        if (type == CredentialPayload.class) {
            return toCredentialPayload(jwt, webRequest);
        }
        if (type == JwtPayload.class) {
            return toJwtPayload(jwt);
        }
        return null;
    }

    private Jwt getJwtFromSecurityContext() {
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

    private CredentialPayload toCredentialPayload(Jwt jwt, NativeWebRequest webRequest) {
        String authProviderId = jwt.getSubject();
        String email = jwt.getClaimAsString("email");

        // app_metadata.provider에서 소셜 로그인 제공자 추출
        String authProvider = extractAuthProvider(jwt);

        // X-Profile-Id 헤더 파싱
        UUID profileId = extractProfileId(webRequest);

        return new CredentialPayload(authProviderId, authProvider, email, profileId);
    }

    @SuppressWarnings("unchecked")
    private String extractAuthProvider(Jwt jwt) {
        Object appMetadata = jwt.getClaim("app_metadata");
        if (appMetadata instanceof Map<?, ?> metadata) {
            Object provider = metadata.get("provider");
            if (provider != null) {
                return provider.toString().toUpperCase();
            }
        }
        return null;
    }

    private UUID extractProfileId(NativeWebRequest webRequest) {
        String header = webRequest.getHeader(PROFILE_ID_HEADER);
        if (header == null || header.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(header);
        } catch (IllegalArgumentException e) {
            throw new WellKnownException("INVALID_PROFILE_ID", 400, "유효하지 않은 프로필 ID 형식");
        }
    }

    private JwtPayload toJwtPayload(Jwt jwt) {
        return new JwtPayload(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                jwt.getIssuer() != null ? jwt.getIssuer().toString() : null,
                jwt.getIssuedAt(),
                jwt.getExpiresAt(),
                jwt.getClaims()
        );
    }
}
