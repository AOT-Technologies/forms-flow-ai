package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationAudit {
    private String applicationStatus;
    private String formUrl;
    private String submittedBy;
    private String color;
    private Double percentage;
}
