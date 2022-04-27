package org.camunda.bpm.extension.hooks.listeners.data;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class FilterInfo implements Serializable {

	private static final long serialVersionUID = 1L;

    private String key;
    private String defaultLabel;
    private String label;
}
