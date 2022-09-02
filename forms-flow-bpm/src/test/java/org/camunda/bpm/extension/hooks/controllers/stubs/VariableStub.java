package org.camunda.bpm.extension.hooks.controllers.stubs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.extension.hooks.controllers.data.Variable;

/**
 * Variable Stub.
 * Stub class for Variable.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VariableStub extends Variable {

    private String name;
    private String value;
}
