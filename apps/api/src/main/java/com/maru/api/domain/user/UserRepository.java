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

    boolean existsByUserTag(String userTag);

    @Query("SELECT * FROM insert_user(:userTag, :email, :name)")
    UserEntity insertUser(
            @Param("userTag") String userTag,
            @Param("email") String email,
            @Param("name") String name);
}
