/*
 * Custom JAX-RS resource for /realms/{realm}/register-tenant.
 * Creates auth session with create_tenant=true and runs registration flow (processor.authenticate()).
 * If custom template rendering from REST is feasible, it can be added to render register-tenant.ftl; otherwise this fallback returns the default registration form.
 */

package com.formsflow.idm.tenant;

import java.net.URI;

import org.jboss.logging.Logger;
import org.keycloak.OAuth2Constants;
import org.keycloak.authentication.AuthenticationProcessor;
import org.keycloak.events.EventBuilder;
import org.keycloak.events.EventType;
import org.keycloak.models.AuthenticationFlowModel;
import org.keycloak.models.ClientModel;
import org.keycloak.models.Constants;
import org.keycloak.models.KeycloakSession;
import org.keycloak.models.RealmModel;
import org.keycloak.protocol.AuthorizationEndpointBase;
import org.keycloak.protocol.oidc.OIDCLoginProtocol;
import org.keycloak.protocol.oidc.utils.RedirectUtils;
import org.keycloak.services.ErrorPage;
import org.keycloak.services.Urls;
import org.keycloak.services.managers.AuthenticationSessionManager;
import org.keycloak.services.messages.Messages;
import org.keycloak.services.resource.RealmResourceProvider;
import org.keycloak.services.resources.LoginActionsService;
import org.keycloak.services.util.LocaleUtil;
import org.keycloak.sessions.AuthenticationSessionModel;
import org.keycloak.sessions.RootAuthenticationSessionModel;

import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Response;

public class RegisterTenantResource implements RealmResourceProvider {

    private static final Logger logger = Logger.getLogger(RegisterTenantResource.class);
    private static final String CREATE_TENANT_PARAM = "create_tenant";

    private final KeycloakSession session;

    public RegisterTenantResource(KeycloakSession session) {
        this.session = session;
    }

    @Override
    public Object getResource() {
        return this;
    }

    @Override
    public void close() {
    }

    @GET
    @Path("")
    public Response registerTenant(
            @QueryParam(Constants.CLIENT_ID) String clientId,
            @QueryParam(OAuth2Constants.REDIRECT_URI) String redirectUri,
            @QueryParam(CREATE_TENANT_PARAM) String createTenant) {

        RealmModel realm = session.getContext().getRealm();

        if (!realm.isRegistrationAllowed()) {
            logger.warnf("Registration not allowed for realm: %s", realm.getName());
            return ErrorPage.error(session, null, Response.Status.BAD_REQUEST, Messages.REGISTRATION_NOT_ALLOWED);
        }

        if (clientId == null || clientId.isEmpty()) {
            return ErrorPage.error(session, null, Response.Status.BAD_REQUEST, Messages.MISSING_PARAMETER, Constants.CLIENT_ID);
        }

        ClientModel client = realm.getClientByClientId(clientId);
        if (client == null) {
            return ErrorPage.error(session, null, Response.Status.BAD_REQUEST, Messages.CLIENT_NOT_FOUND);
        }
        if (!client.isEnabled()) {
            return ErrorPage.error(session, null, Response.Status.BAD_REQUEST, Messages.CLIENT_DISABLED);
        }

        try {
            AuthenticationSessionManager authSessionManager = new AuthenticationSessionManager(session);
            RootAuthenticationSessionModel rootAuthSession = authSessionManager.createAuthenticationSession(realm, true);
            AuthenticationSessionModel authSession = rootAuthSession.createAuthenticationSession(client);

            authSession.setAction(AuthenticationSessionModel.Action.AUTHENTICATE.name());
            authSession.setProtocol(client.getProtocol() != null ? client.getProtocol() : "openid-connect");

            // Trigger tenant creation in FormAction only when create_tenant query param is true
            if (createTenant != null && "true".equalsIgnoreCase(createTenant.trim())) {
                authSession.setAuthNote(PreTenantCreationFormAction.CREATE_TENANT_REQUIRED_NOTE, "true");
                authSession.setClientNote(PreTenantCreationFormAction.CREATE_TENANT_CLIENT_NOTE, "true");
            }
            authSession.setClientNote(AuthorizationEndpointBase.APP_INITIATED_FLOW, LoginActionsService.REGISTRATION_PATH);
            authSession.setClientNote(OIDCLoginProtocol.RESPONSE_TYPE_PARAM, OAuth2Constants.CODE);

            String finalRedirectUri;
            if (redirectUri != null && !redirectUri.isEmpty()) {
                String verified = RedirectUtils.verifyRedirectUri(session, redirectUri, client);
                if (verified == null) {
                    return ErrorPage.error(session, null, Response.Status.BAD_REQUEST, Messages.INVALID_REDIRECT_URI);
                }
                finalRedirectUri = verified;
            } else {
                URI accountUrl = Urls.accountBase(session.getContext().getUri().getBaseUri()).path("/").build(realm.getName());
                finalRedirectUri = accountUrl.toString();
            }
            // redirect_uri is used by Keycloak for post-registration redirect after successful signup
            authSession.setRedirectUri(finalRedirectUri);
            authSession.setClientNote(OIDCLoginProtocol.REDIRECT_URI_PARAM, finalRedirectUri);
            authSession.setClientNote(OIDCLoginProtocol.ISSUER, Urls.realmIssuer(session.getContext().getUri().getBaseUri(), realm.getName()));

            authSessionManager.setAuthSessionCookie(rootAuthSession.getId());
            authSessionManager.setAuthSessionIdHashCookie(rootAuthSession.getId());
            LocaleUtil.processLocaleParam(session, realm, authSession);

            EventBuilder event = new EventBuilder(realm, session, session.getContext().getConnection());
            event.event(EventType.REGISTER);

            AuthenticationFlowModel flow = realm.getRegistrationFlow();
            String flowId = flow.getId();

            AuthenticationProcessor processor = new AuthenticationProcessor();
            processor.setAuthenticationSession(authSession)
                    .setFlowPath(LoginActionsService.REGISTRATION_PATH)
                    .setBrowserFlow(true)
                    .setFlowId(flowId)
                    .setConnection(session.getContext().getConnection())
                    .setEventBuilder(event)
                    .setRealm(realm)
                    .setSession(session)
                    .setUriInfo(session.getContext().getUri())
                    .setRequest(session.getContext().getHttpRequest());

            logger.infof("Register-tenant flow started. Client: %s, TabId: %s", clientId, authSession.getTabId());

            return processor.authenticate();
        } catch (Exception e) {
            logger.errorf(e, "Error initiating register-tenant");
            return ErrorPage.error(session, null, Response.Status.INTERNAL_SERVER_ERROR, "Error initiating registration. Please try again later.");
        }
    }
}
