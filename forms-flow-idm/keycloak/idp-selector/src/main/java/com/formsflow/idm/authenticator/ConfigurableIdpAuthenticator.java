package com.formsflow.idm.authenticator;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.keycloak.authentication.AuthenticationFlowContext;
import org.keycloak.authentication.Authenticator;
import org.keycloak.models.AuthenticatorConfigModel;
import org.keycloak.models.IdentityProviderModel;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.models.UserModel;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * IDP Authenticator used to selectively display Identity Providers based on the client scopes.
 */
public class ConfigurableIdpAuthenticator implements Authenticator {

	private static final Logger logger = LoggerFactory.getLogger(ConfigurableIdpAuthenticator.class);

	/**
	 * Set the identity providers based on the client scope
	 * 1 :  Get the default client scopes for the client which initiated the authentication
	 * 2 :  Find out the IDPs configured for the client using the scope which starts with idp_
	 * 3 :  Filter the provider models using the scoped idps and set ito the attribute
	 */
	@Override
	public void authenticate(AuthenticationFlowContext context) {
		AuthenticatorConfigModel config = context.getAuthenticatorConfig();
		logger.info("Inside ConfigurableIdpAuthenticator --> authenticate");

		List<String> idpScopes = new ArrayList<String>();
		List<IdentityProviderModel> identityProviders = new ArrayList<IdentityProviderModel>();

		logger.info("context.getAuthenticationSession().getClient().getAttributes() {}",
				context.getAuthenticationSession().getClient().getClientScopes(true));


		for (String key : context.getAuthenticationSession().getClient().getClientScopes(true).keySet()) {
			if (key.startsWith("idp_")) {
				idpScopes.add(key.replaceFirst("idp_", ""));
			}
		}

		logger.info("Inside ConfigurableIdpAuthenticator --> idpScopes: {}", idpScopes);

		if (!idpScopes.isEmpty()) {
			// Filter the IDPs based on the configuration
			identityProviders = context.getRealm().getIdentityProvidersStream()
					.filter(idp -> idpScopes.contains(idp.getAlias())).collect(Collectors.toList());

			logger.info("Inside ConfigurableIdpAuthenticator --> identityProviders: {}", identityProviders);

		}

		for (IdentityProviderModel idpModel : identityProviders) {
			logger.info("IdentityProviderModel: {}", idpModel);
			logger.info("idpModel.getDisplayName: {}", idpModel.getDisplayName());
			logger.info("idpModel.getAlias: {}", idpModel.getAlias());
			logger.info("idpModel.getInternalId: {}", idpModel.getInternalId());
			logger.info("idpModel.getProviderId: {}", idpModel.getProviderId());
		}
		context.form().setAttribute("numberOfIdps", identityProviders.size());
		context.challenge(
				context.form().setAttribute("identityProviders", identityProviders).createLoginUsernamePassword());

	}

	@Override
	public void action(AuthenticationFlowContext context) {
		String selectedIdp = context.getHttpRequest().getDecodedFormParameters().getFirst("selectedIdp");
		if (selectedIdp != null) {
			context.getAuthenticationSession().setClientNote("selectedIdp", selectedIdp);
			context.getAuthenticationSession().setAuthNote("selectedIdp", selectedIdp);
			context.success();
		}

	}

	@Override
	public boolean requiresUser() {
		return false;
	}

	@Override
	public boolean configuredFor(KeycloakSession session, RealmModel realm, UserModel user) {
		return true;
	}

	@Override
	public void setRequiredActions(KeycloakSession session, RealmModel realm, UserModel user) {
	}

	@Override
	public void close() {
	}
}
