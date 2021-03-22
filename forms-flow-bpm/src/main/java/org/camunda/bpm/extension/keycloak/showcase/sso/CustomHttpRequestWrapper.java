package org.camunda.bpm.extension.keycloak.showcase.sso;

import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletRequestWrapper;
import java.util.*;

/**
 * This class is intended to support adding authentication header to socket calls.
 *
 * @author sumathi.thirumani@aot-technologies.com
 */
@Component
public class CustomHttpRequestWrapper extends HttpServletRequestWrapper {
    private final Map<String, String> customHeaders;

    public CustomHttpRequestWrapper(HttpServletRequest request){
        super(request);
        this.customHeaders = new HashMap<String, String>();
    }


    public void addHeader(String name, String value){
        this.customHeaders.put(name, value);
    }

    public String getHeader(String name) {
        // check the custom headers first
        String headerValue = customHeaders.get(name);

        if (headerValue != null){
            return headerValue;
        }
        // else return from into the original wrapped object
        return ((HttpServletRequest) getRequest()).getHeader(name);
    }

    public Enumeration<String> getHeaderNames() {
        // create a set of the custom header names
        Set<String> set = new HashSet<String>(customHeaders.keySet());

        // now add the headers from the wrapped request object
        @SuppressWarnings("unchecked")
        Enumeration<String> e = ((HttpServletRequest) getRequest()).getHeaderNames();
        while (e.hasMoreElements()) {
            // add the names of the request headers into the list
            String n = e.nextElement();
            set.add(n);
        }

        // create an enumeration from the set and return
        return Collections.enumeration(set);
    }

}
