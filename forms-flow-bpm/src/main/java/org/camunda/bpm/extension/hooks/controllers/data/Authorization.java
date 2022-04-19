package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

/**
 * Mapper associated with querying authorization.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Authorization {
    private String groupId;
    private String userId;
    private String resourceId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Authorization that = (Authorization) o;
        return groupId.equals(that.groupId) && userId.equals(that.userId) && resourceId.equals(that.resourceId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(groupId, userId, resourceId);
    }

    @Override
    public String toString() {
        return "Authorization{" +
                "groupId='" + groupId + '\'' +
                ", userId='" + userId + '\'' +
                ", resourceId='" + resourceId + '\'' +
                '}';
    }
}
