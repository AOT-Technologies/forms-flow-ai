package org.bpm.utils.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProcessDefinitionDto {
    private String id;
    private String key;
    private String tenantId;
    private String name;
    private String description;
    private int version;
    private String resource;
    private String deploymentId;
    private boolean suspended;
}
