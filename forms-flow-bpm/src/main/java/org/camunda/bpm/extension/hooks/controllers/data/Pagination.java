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
public class Pagination implements Serializable {

	private static final long serialVersionUID = 1L;

	/**
	 *
	 */
	private Integer pageNo;
	/**
	 *
	 */
	private Integer limit;

	/**
	 *
	 */
	private Sorting sorting;

}
