package com.maru.api.config.auth;

import org.springframework.core.MethodParameter;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class RequestPayloadResolver implements HandlerMethodArgumentResolver {

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
            return toCredentialPayload(jwt);
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

    private CredentialPayload toCredentialPayload(Jwt jwt) {
        return new CredentialPayload(
                jwt.getSubject(),
                jwt.getClaimAsString("email")
        );
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
