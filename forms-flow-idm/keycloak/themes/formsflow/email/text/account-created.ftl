<#--
    Plain text email template for account-created notification.
    Attributes: username, firstName, lastName, email, realmName, redirectUri (optional link to app).
-->
Welcome ${firstName!"there"}!

Your account has been successfully created.

Account Details:
- Username: ${username!""}
- Email: ${email!""}
- Realm: ${realmName!""}

Thank you for joining us!
<#if redirectUri?? && redirectUri?has_content>

Sign in / Open app: ${redirectUri}
</#if>
