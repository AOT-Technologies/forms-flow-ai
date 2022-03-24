package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterInfo {

    private String key;
    private Object value;
    private String label;
}
