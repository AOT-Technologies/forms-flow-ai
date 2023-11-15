package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Objects;

/**
 * Authorized Action.
 * Class for holding Authorized Action data.
 */
@NoArgsConstructor
@Data
public class AuthorizedAction {
    private String formId;
    private String formName;
    private String processKey;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        AuthorizedAction that = (AuthorizedAction) o;
        return Objects.equals(formId, that.formId) && Objects.equals(formName, that.formName) && Objects.equals(processKey, that.processKey);
    }

    @Override
    public int hashCode() {
        return Objects.hash(formId, formName, processKey);
    }
}
