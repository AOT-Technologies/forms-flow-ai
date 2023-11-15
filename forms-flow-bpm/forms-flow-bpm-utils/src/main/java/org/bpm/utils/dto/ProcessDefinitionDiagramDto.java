package org.bpm.utils.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProcessDefinitionDiagramDto {
    private String bpmn20Xml;
}
