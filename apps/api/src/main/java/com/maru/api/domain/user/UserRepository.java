package com.maru.api.domain.user;

import com.maru.api.entity.UserEntity;
import org.springframework.data.jdbc.repository.query.Modifying;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends CrudRepository<UserEntity, String> {

    // 단순 조회 — Spring Data 자동 생성
    Optional<UserEntity> findByEmail(String email);

    // INSERT
    @Modifying
    @Query("""
            INSERT INTO users (user_id, auth_provider, auth_provider_id, email, name, created_at, updated_at)
            VALUES (:#{#user.userId}, :#{#user.authProvider}, :#{#user.authProviderId},
                    :#{#user.email}, :#{#user.name}, NOW(), NOW())
            RETURNING *
            """)
    UserEntity insert(@Param("user") UserEntity user);

    // native SQL 조회
    @Query("SELECT * FROM users WHERE auth_provider = :provider AND auth_provider_id = :providerId")
    Optional<UserEntity> findByAuthProvider(@Param("provider") String provider,
                                           @Param("providerId") String providerId);

    // 프로시저 호출 (변경)
    @Modifying
    @Query("CALL update_user_info(:userId, :name, :phone)")
    void updateInfo(@Param("userId") UUID userId,
                    @Param("name") String name,
                    @Param("phone") String phone);

    // 펑션 호출 (조회)
    @Query("SELECT get_user_display_name(:userId)")
    String getDisplayName(@Param("userId") UUID userId);
}
