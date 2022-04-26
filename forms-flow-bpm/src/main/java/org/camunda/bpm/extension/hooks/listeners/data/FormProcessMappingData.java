package org.camunda.bpm.extension.hooks.listeners.data;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.extension.commons.ro.res.IResponse;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
public class FormProcessMappingData implements IResponse, Serializable {

	private static final long serialVersionUID = 1L;
	@JsonProperty("taskVariable")
	private List<FilterInfo> taskVariable;
	private String processName;
	private String processKey;
}
