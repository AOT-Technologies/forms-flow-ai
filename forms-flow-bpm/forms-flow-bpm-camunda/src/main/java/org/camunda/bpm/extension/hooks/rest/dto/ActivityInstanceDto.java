package org.camunda.bpm.extension.hooks.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ActivityInstanceDto extends org.camunda.bpm.engine.rest.dto.runtime.ActivityInstanceDto {

    private ActivityInstanceDto[] childActivityInstances;
    private TransitionInstanceDto[] childTransitionInstances;
}
