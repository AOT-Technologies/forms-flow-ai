package org.camunda.bpm.extension.hooks.rest.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.engine.rest.dto.VariableQueryParameterDto;

import java.util.Arrays;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TaskFilterResponse {

    private List<TaskFilterVariableQueryDto> variables;
    private TaskVariableDto taskVisibleAttributes;
}
