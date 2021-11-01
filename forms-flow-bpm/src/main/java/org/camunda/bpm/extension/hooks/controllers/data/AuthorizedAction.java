package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class AuthorizedAction {
    private String formId;
    private String formName;
    private String processKey;
}
