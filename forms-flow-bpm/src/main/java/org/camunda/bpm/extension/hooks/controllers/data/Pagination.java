package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 *This class has the pagination informations and sorting details
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pagination implements Serializable {

	private static final long serialVersionUID = 1L;

	/**
	 * Page number - search integer
	 */
	private Integer pageNo;
	/**
	 * Limit for each page
	 */
	private Integer limit;

	/**
	 * Sorting Data
	 */
	private Sorting sorting;

}
