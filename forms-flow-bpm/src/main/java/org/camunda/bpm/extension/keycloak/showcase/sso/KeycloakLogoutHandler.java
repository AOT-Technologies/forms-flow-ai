package org.camunda.bpm.extension.keycloak.showcase.sso;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Cookie;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * Keycloak Logout Handler.
 */
@Service
public class KeycloakLogoutHandler implements LogoutSuccessHandler {

	/** This class' logger. */
	private static final Logger LOG = LoggerFactory.getLogger(KeycloakLogoutHandler.class);
	
	/** Redirect strategy. */
	private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();
	
	/** Keycloak's logout URI. */
	private String oauth2UserLogoutUri;
	
	/**
	 * Default constructor.
	 * @param oauth2UserAuthorizationUri configured keycloak authorization URI
	 */
	public KeycloakLogoutHandler(@Value("${security.oauth2.client.user-authorization-uri:}") String oauth2UserAuthorizationUri) {
		if (!StringUtils.isEmpty(oauth2UserAuthorizationUri)) {
			// in order to get the valid logout uri: simply replace "/auth" at the end of the user authorization uri with "/logout"
			this.oauth2UserLogoutUri = oauth2UserAuthorizationUri.replace("openid-connect/auth", "openid-connect/logout");
		}
	}

	/**
	 * {@inheritDoc}
	 */
	@Override
	public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
			throws IOException, ServletException {
		if (!StringUtils.isEmpty(oauth2UserLogoutUri)) {
			// Calculate redirect URI for Keycloak, something like http://<host:port>/camunda/login
			String requestUrl = request.getRequestURL().toString();
			String redirectUri = requestUrl.substring(0, requestUrl.indexOf("/app")) + "/login";
			// Complete logout URL
			String logoutUrl = oauth2UserLogoutUri + "?redirect_uri=" + redirectUri;
			Cookie[] cookies = request.getCookies();
			for (Cookie cookie : cookies) {
				LOG.error("-------cookie---------->"+cookie.getName());
				cookie.setMaxAge(0);
				cookie.setValue(null);
				cookie.setPath("/camunda");
				response.addCookie(cookie);
			}
			LOG.error("-------context path---------->"+request.getContextPath());
			//To remove JSESSIONID
			Cookie cookieWithSlash = new Cookie("JSESSIONID", null);
			//Tomcat adds extra slash at the end of context path (e.g. "/foo/")
			cookieWithSlash.setPath(request.getContextPath() + "/");
			cookieWithSlash.setMaxAge(0);

			Cookie cookieWithoutSlash = new Cookie("JSESSIONID", null);
			//JBoss doesn't add extra slash at the end of context path (e.g. "/foo")
			cookieWithoutSlash.setPath(request.getContextPath());
			cookieWithoutSlash.setMaxAge(0);

			//Remove cookies on logout so that invalidSessionURL (session timeout) is not displayed on proper logout event
			response.addCookie(cookieWithSlash); //For Tomcat
			response.addCookie(cookieWithoutSlash); //For JBoss
			// Do logout by redirecting to Keycloak logout
			LOG.error("Redirecting to logout URL {}", logoutUrl);
			redirectStrategy.sendRedirect(request, response, logoutUrl);
		}
	}	
	
}
