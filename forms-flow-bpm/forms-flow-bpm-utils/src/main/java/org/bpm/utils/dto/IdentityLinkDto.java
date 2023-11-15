package org.bpm.utils.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class IdentityLinkDto {
    private String userId;
    private String groupId;
    private String type;
}
