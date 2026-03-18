package com.maru.api.domain.profile;

import com.maru.api.entity.ProfileEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProfileRepository extends CrudRepository<ProfileEntity, UUID> {

    List<ProfileEntity> findByUserId(UUID userId);

    Optional<ProfileEntity> findByUserIdAndType(UUID userId, ProfileEntity.ProfileType type);
}
