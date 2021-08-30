package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Sumathi Thirumani
 * @author Shibin Thomas
 */
@Data
@NoArgsConstructor
public class FormElement {
    private String op;
    private String path;
    private String value;

    public FormElement(String elementId, String value) {
        this.op = "replace";
        this.path = "/data/" + elementId;
        this.value = value;
    }
}
