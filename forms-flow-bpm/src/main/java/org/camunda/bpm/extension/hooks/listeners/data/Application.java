package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @author Sumathi Thirumani
 * @author Shibin Thomas
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application{
    private String applicationStatus;
    private String formUrl;
    private String submittedBy;
}
