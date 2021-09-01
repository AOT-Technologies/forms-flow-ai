package org.camunda.bpm.extension.hooks.listeners.data;

import com.fasterxml.jackson.databind.JsonNode;
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
public class FormSubmission{
    private JsonNode data;
}
