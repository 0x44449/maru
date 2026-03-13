package com.maru.api.entity;

import lombok.*;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("department_members")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class DepartmentMemberEntity {

    @Column("department_id")
    private String departmentId;

    @Column("profile_id")
    private String profileId;
}
