package org.camunda.bpm.extension.hooks.controllers.data;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthorizationInfo implements Serializable {

	private static final long serialVersionUID = 1L;

    private boolean adminGroupEnabled;
<<<<<<< HEAD
    private List<Authorization> authorizationList;
=======
    private Set<Authorization> authorizationList;
>>>>>>> c9267d23c54b00ca1b535c751293dea0953bd689
}
