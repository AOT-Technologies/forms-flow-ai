package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * This class has the sorting deatils
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Sorting implements Serializable {

	private static final long serialVersionUID = 1L;

	/**
	 *Column name - search string
	 */
	private String sortBy;
	/**
	 * Sort by ascending or decending
	 */
	private String sortOrder;
}

