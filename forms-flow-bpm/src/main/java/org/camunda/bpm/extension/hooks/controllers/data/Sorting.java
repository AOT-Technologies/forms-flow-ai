package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 *
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sorting implements Serializable {

	private static final long serialVersionUID = 1L;

	/**
	 *
	 */
	private String sortBy;
	/**
	 *
	 */
	private String sortOrder;
}

