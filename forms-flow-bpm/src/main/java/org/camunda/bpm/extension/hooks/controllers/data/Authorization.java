package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Mapper associated with querying authorization.
 */
@NoArgsConstructor
@Data
public class Authorization {
    private String groupId;
    private String userId;
    private String resourceId;
}
