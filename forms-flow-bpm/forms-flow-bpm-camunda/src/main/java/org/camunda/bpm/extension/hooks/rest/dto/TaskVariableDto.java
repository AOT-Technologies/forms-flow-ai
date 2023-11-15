package org.camunda.bpm.extension.hooks.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class TaskVariableDto {

    private Boolean applicationId;
    private Boolean assignee;
    private Boolean taskTitle;
    private Boolean createdDate;
    private Boolean dueDate;
    private Boolean followUp;
    private Boolean priority;
    private Boolean groups;

}
