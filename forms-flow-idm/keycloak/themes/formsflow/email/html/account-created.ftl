<#--
    HTML email template for account-created notification.
    Used by AccountCreatedEmailSender (PostTenantAssignmentFormAction).
    Attributes: username, firstName, lastName, email, realmName, redirectUri (optional link to app).
-->
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1f4e79; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }
        .account-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 5px; border-left: 4px solid #1f4e79; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to Formsflow!</h1>
    </div>
    <div class="content">
        <p>Hello ${firstName!"there"},</p>
        <p>Your account has been successfully created.</p>
        <div class="account-details">
            <h3>Account Details:</h3>
            <ul>
                <li><strong>Username:</strong> ${username!""}</li>
                <li><strong>Email:</strong> ${email!""}</li>
                <li><strong>Realm:</strong> ${realmName!""}</li>
            </ul>
        </div>
        <p>Thank you for joining us!</p>
        <#if redirectUri?? && redirectUri?has_content>
        <p><a href="${redirectUri}" style="display: inline-block; background-color: #1f4e79; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin-top: 10px;">Sign in / Open app</a></p>
        </#if>
    </div>
    <div class="footer">
        <p>This is an automated message. Please do not reply to this email.</p>
    </div>
</body>
</html>
