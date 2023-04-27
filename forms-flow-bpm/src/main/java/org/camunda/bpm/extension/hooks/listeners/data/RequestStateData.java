package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestStateData implements Serializable {
    private String formUrl;
    private String submittedBy;
    private String requestType;
    private String requestStatus;
    private String isRequest;
}
