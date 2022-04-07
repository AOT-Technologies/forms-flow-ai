package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationInfo implements Serializable {

	private static final long serialVersionUID = 1L;

    private boolean adminGroupEnabled;
    private List<Authorization> authorizationList;
}
