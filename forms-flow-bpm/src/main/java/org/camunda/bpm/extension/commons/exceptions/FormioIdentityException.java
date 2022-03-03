package org.camunda.bpm.extension.commons.exceptions;

/**
 * To throw during the identity provider setup / token refresh
 */
public class FormioIdentityException extends RuntimeException{

    private static final long serialVersionUID = 1L;

    public FormioIdentityException(String message) {
        super(message);
    }

    public FormioIdentityException(String message, Throwable cause) {
        super(message, cause);
    }
}
