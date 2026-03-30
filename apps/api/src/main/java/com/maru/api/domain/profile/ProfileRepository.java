package com.maru.api.domain.profile;

import com.maru.api.entity.ProfileEntity;
import org.springframework.data.jdbc.repository.query.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends CrudRepository<ProfileEntity, UUID> {

    List<ProfileEntity> findByUserId(UUID userId);

    Optional<ProfileEntity> findByUserIdAndType(UUID userId, ProfileEntity.ProfileType type);

    @Query("SELECT * FROM insert_profile(:userId, :type, :displayName, :profileImageUrl)")
    ProfileEntity insertProfile(
            @Param("userId") UUID userId,
            @Param("type") String type,
            @Param("displayName") String displayName,
            @Param("profileImageUrl") String profileImageUrl);
}
