package org.camunda.bpm.extension.hooks.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import org.camunda.bpm.engine.rest.sub.runtime.impl.FilterResourceImpl;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskQueryDto extends org.camunda.bpm.engine.rest.dto.task.TaskQueryDto {
}
