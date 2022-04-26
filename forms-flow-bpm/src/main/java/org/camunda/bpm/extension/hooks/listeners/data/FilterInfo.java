package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FilterInfo implements Serializable {

	private static final long serialVersionUID = 1L;

    private String key;
    private Object value;
    private String label;
}
