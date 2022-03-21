package org.camunda.bpm.extension.hooks.listeners.data;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
public class FormProcessMappingData implements Serializable {

	private static final long serialVersionUID = 1L;

	private String taskVariable;
	private String processName;
	private String processKey;
}
