package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Created by DELL on 06-08-2021.
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
