package org.camunda.bpm.extension.hooks.listeners.data;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.extension.commons.ro.res.IResponse;

import java.io.Serializable;

@Data
@NoArgsConstructor
public class FormProcessMappingData implements IResponse, Serializable {

	private static final long serialVersionUID = 1L;
	private String taskVariable;
	private String processName;
	private String processKey;

	public FilterInfo[] getTaskVariableList(ObjectMapper objectMapper) throws JsonProcessingException {
		return objectMapper.readValue(this.taskVariable, FilterInfo[].class);
	}
}
