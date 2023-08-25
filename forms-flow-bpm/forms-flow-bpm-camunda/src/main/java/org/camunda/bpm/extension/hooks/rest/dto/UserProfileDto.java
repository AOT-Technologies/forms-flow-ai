package org.camunda.bpm.extension.hooks.rest.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.io.Serializable;

@JsonIgnoreProperties(ignoreUnknown = true)
public class UserProfileDto extends org.camunda.bpm.engine.rest.dto.identity.UserProfileDto implements Serializable {
    private static final long serialVersionUID = 1L;
}
