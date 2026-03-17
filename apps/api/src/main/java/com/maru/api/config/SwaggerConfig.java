package com.maru.api.config;

import com.maru.api.config.auth.RequestPayload;
import com.maru.api.config.exception.ErrorResponse;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.media.StringSchema;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springdoc.core.utils.SpringDocUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {

    static {
        SpringDocUtils.getConfig().addAnnotationsToIgnore(RequestPayload.class);
    }

    @Bean
    public OpenAPI openAPI() {
        String schemeName = "Bearer Auth";

        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(schemeName))
                .components(new Components()
                        .addSecuritySchemes(schemeName, new SecurityScheme()
                                .name(schemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                        )
                );
    }

    @Bean
    public OpenApiCustomizer globalErrorResponseCustomizer() {
        return openApi -> {
            // ErrorResponse 스키마 등록
            var schemas = openApi.getComponents().getSchemas();
            if (schemas == null || !schemas.containsKey("ErrorResponse")) {
                openApi.getComponents().addSchemas("ErrorResponse", new Schema<ErrorResponse>()
                        .type("object")
                        .addProperty("errorCode", new StringSchema())
                        .addProperty("message", new StringSchema()));
            }

            // 모든 엔드포인트에 에러 응답 추가
            var errorContent = new Content().addMediaType("application/json",
                    new MediaType().schema(new Schema<ErrorResponse>().$ref("#/components/schemas/ErrorResponse")));

            openApi.getPaths().values().forEach(pathItem ->
                    pathItem.readOperations().forEach(operation -> {
                        var responses = operation.getResponses();
                        responses.addApiResponse("401",
                                new ApiResponse().description("인증 필요").content(errorContent));
                        responses.addApiResponse("500",
                                new ApiResponse().description("서버 오류").content(errorContent));
                    })
            );
        };
    }
}
