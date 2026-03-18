package com.maru.api.domain.user;

import com.maru.api.entity.UserEntity;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends CrudRepository<UserEntity, UUID> {

    Optional<UserEntity> findByEmail(String email);

    Optional<UserEntity> findByUserTag(String userTag);

    @Query("SELECT * FROM users WHERE auth_provider = :provider AND auth_provider_id = :providerId")
    Optional<UserEntity> findByAuthProviderAndAuthProviderId(
            @Param("provider") String provider,
            @Param("providerId") String providerId);

    boolean existsByUserTag(String userTag);
}
