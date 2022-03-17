package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * This class has the form search information and pagination details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormRO implements Serializable {

	private static final long serialVersionUID = 1L;

	/**
	 * Wild card form Name - search string
	 */
	private String formName;
	/**
	 * Pagination Data
	 */
	private Pagination pagination;

}
