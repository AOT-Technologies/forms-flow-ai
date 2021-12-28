package org.camunda.bpm.extension.hooks.listeners.stubs;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.camunda.bpm.engine.identity.User;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserStub implements User {

    private String id;
    private String firstName;
    private String lastName;
    private String email;
    private String password;
}
