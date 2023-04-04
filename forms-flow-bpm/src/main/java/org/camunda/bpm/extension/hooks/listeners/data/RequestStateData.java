package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestStateData {

    private String formUrl;
    private String submittedBy;
    private String requestName;
    private String requestStatus;
    private boolean isRequest;
}
