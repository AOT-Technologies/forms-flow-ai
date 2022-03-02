package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FormSearchInfo implements Serializable {

	private static final long serialVersionUID = 1L;

    private List<AuthorizedAction> formDataList;
    private Pagination pagination;
    private int totalCount;
}
