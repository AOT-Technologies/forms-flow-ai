package org.camunda.bpm.extension.hooks.listeners;

import org.camunda.bpm.engine.delegate.ExecutionListener;
import org.camunda.bpm.engine.delegate.DelegateExecution;
import javax.naming.NamingEnumeration;
import javax.naming.NamingException;
import javax.naming.Context;
import javax.naming.directory.*;

import java.util.logging.Logger;
import java.util.Hashtable;

/**
 * This class prepares and populates the variables of email within camunda context.
 *
 * @author  gurumoorthy.mohan@aot-technologies.com
 */
public class ActiveDirectoryListener implements ExecutionListener {

    private final Logger LOGGER = Logger.getLogger(ActiveDirectoryListener.class.getName());
 
	@Override
    public void notify(DelegateExecution execution) throws Exception {
		LOGGER.info("ActiveDirectoryListener input : "+execution.getVariables());
		String ldapUser = String.valueOf(execution.getVariable("ldapUser"));
		String ldapAuth = String.valueOf(execution.getVariable("ldapAuth"));
		String userId = String.valueOf(execution.getVariable("user_idir"));
		String isNewUser = String.valueOf(execution.getVariable("isNewUser"));
		if(isNewUser.equalsIgnoreCase("Y")){
			String idir_user_guid = searchUserId(ldapUser, ldapAuth, userId);
			execution.setVariable("idir_user_guid", idir_user_guid);
		}
		LOGGER.info("ActiveDirectoryListener output: "+execution.getVariables());		
	}

	public String searchUserId(String ldapUser, String ldapAuth,String userid) {
        String guid = null;
        String searchFilter ="(&(objectCategory=person)(objectClass=user)(sAMAccountName=" + userid + "))";
        try {
            NamingEnumeration answer =
                getLDAPAttrs(ldapUser, ldapAuth, searchFilter, "idir.BCGOV", "idir", "OU=BCGOV,DC=idir,DC=BCGOV");
            String uid = "";

            while (answer.hasMoreElements()) {
                SearchResult sr = (SearchResult)answer.next();
                Attributes attrs = sr.getAttributes();
                try {
                    uid = attrs.get("sAMAccountName").toString();
					guid = attrs.get("bcgovGUID").toString();
                    uid = uid.substring(uid.indexOf(':') + 2);
					guid = guid.substring(guid.indexOf(':') + 2);
                } catch (Exception err) {
                    System.out.println(err.getMessage());
                    err.printStackTrace();
                }
                // verify userid
                if (userid.equalsIgnoreCase(uid)) {
                    return guid;
                }
            }
        } catch (NamingException ne) {
            System.out.println("In authenticateWithLDAP, LDAP Authentication NamingException : " +
                               ne.getMessage());
							   ne.printStackTrace();
        } catch (Exception ex) {
            System.out.println("In authenticateWithLDAP, LDAP Authentication Exception : " +
                               ex.getMessage());
							   ex.printStackTrace();
        }
        return guid;
    }

    private NamingEnumeration getLDAPAttrs(String user, String pass, String searchFilter, String host, String domain, String searchBase) throws NamingException, Exception {
        // set attribute names to obtain value of
        String[] returnedAtts = { "sAMAccountName", "bcgovGUID" };
        SearchControls searchCtls = new SearchControls();
        searchCtls.setReturningAttributes(returnedAtts);

        // specify the search scope
        searchCtls.setSearchScope(SearchControls.SUBTREE_SCOPE);

        // set ldap env values
        Hashtable environment = new Hashtable();
        environment.put(Context.INITIAL_CONTEXT_FACTORY,
                        "com.sun.jndi.ldap.LdapCtxFactory");
        environment.put(Context.PROVIDER_URL, "ldap://" + host);
        environment.put(Context.SECURITY_AUTHENTICATION, "simple");
        environment.put(Context.SECURITY_PRINCIPAL, user + "@" + domain);
        environment.put(Context.SECURITY_CREDENTIALS, pass);

        // set ldap context
        DirContext ctxGC = new InitialDirContext(environment);

        // perform search to obtain values
        NamingEnumeration answer =
            ctxGC.search(searchBase, searchFilter, searchCtls);
        return answer;
    }

}
