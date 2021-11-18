package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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
}
