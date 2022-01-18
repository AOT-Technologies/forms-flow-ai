package org.camunda.bpm.extension.hooks.controllers.stubs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.extension.hooks.controllers.data.Authorization;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationStub extends Authorization {

    private String groupId;
    private String userId;
    private String resourceId;
}
