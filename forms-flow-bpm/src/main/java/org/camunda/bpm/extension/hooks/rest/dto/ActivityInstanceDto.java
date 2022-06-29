package org.camunda.bpm.extension.hooks.rest.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ActivityInstanceDto extends org.camunda.bpm.engine.rest.dto.runtime.ActivityInstanceDto {

    private ActivityInstanceDto[] childActivityInstances;
    private TransitionInstanceDto[] childTransitionInstances;
}
