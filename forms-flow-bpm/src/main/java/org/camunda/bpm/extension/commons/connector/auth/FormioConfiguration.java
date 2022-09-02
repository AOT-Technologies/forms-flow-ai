package org.camunda.bpm.extension.commons.connector.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Formio Configuration.
 * Configuration data for formio.
 */
@Data
@AllArgsConstructor
public class FormioConfiguration {

    /**
     * Formio server userName / email
     */
    private String userName;
    /**
     * Formio server password
     */
    private String password;
    /**
     * Formio token uri
     */
    private String accessTokenUri;
}
