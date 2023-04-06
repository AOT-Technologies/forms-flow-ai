package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Variable.
 * Class for holding variable data.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Variable {
    private String name;
    private String value;
}
