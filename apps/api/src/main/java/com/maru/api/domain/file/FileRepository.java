package com.maru.api.domain.file;

import com.maru.api.entity.FileEntity;
import org.springframework.data.repository.CrudRepository;

import java.util.UUID;

public interface FileRepository extends CrudRepository<FileEntity, UUID> {
}
