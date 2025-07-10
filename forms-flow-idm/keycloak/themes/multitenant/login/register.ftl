<#import "template.ftl" as layout>
    <@layout.registrationLayout; section>
        <#if section=="header">
            ${msg("registerTitle")}
            <#elseif section=="form">
                <form id="kc-register-form" class="${properties.kcFormClass!}" action="${url.registrationAction}" method="post">
                    <input type="hidden" id="clientId" name="clientId" value="" />
                    <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('firstName',properties.kcFormGroupErrorClass!)}">
                        <div class="${properties.kcLabelWrapperClass!}">
                            <label for="firstName" class="${properties.kcLabelClass!}">
                                ${msg("firstName")}
                            </label>
                        </div>
                        <div class="${properties.kcInputWrapperClass!}">
                            <input type="text" id="firstName" class="${properties.kcInputClass!}" name="firstName" value="${(register.formData.firstName!'')}" />
                        </div>
                    </div>
                    <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('lastName',properties.kcFormGroupErrorClass!)}">
                        <div class="${properties.kcLabelWrapperClass!}">
                            <label for="lastName" class="${properties.kcLabelClass!}">
                                ${msg("lastName")}
                            </label>
                        </div>
                        <div class="${properties.kcInputWrapperClass!}">
                            <input type="text" id="lastName" class="${properties.kcInputClass!}" name="lastName" value="${(register.formData.lastName!'')}" />
                        </div>
                    </div>
                    <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('email',properties.kcFormGroupErrorClass!)}">
                        <div class="${properties.kcLabelWrapperClass!}">
                            <label for="email" class="${properties.kcLabelClass!}">
                                ${msg("email")}
                            </label>
                        </div>
                        <div class="${properties.kcInputWrapperClass!}">
                            <input type="text" id="email" class="${properties.kcInputClass!}" name="email" value="${(register.formData.email!'')}" autocomplete="email" />
                        </div>
                    </div>
                    <#if !realm.registrationEmailAsUsername>
                        <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('username',properties.kcFormGroupErrorClass!)}">
                            <div class="${properties.kcLabelWrapperClass!}">
                                <label for="username" class="${properties.kcLabelClass!}">
                                    ${msg("username")}
                                </label>
                            </div>
                            <div class="${properties.kcInputWrapperClass!}">
                                <input type="text" id="username" class="${properties.kcInputClass!}" name="username" value="${(register.formData.username!'')}" autocomplete="username" />
                            </div>
                        </div>
                    </#if>
                    <#if passwordRequired>
                        <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('password',properties.kcFormGroupErrorClass!)}">
                            <div class="${properties.kcLabelWrapperClass!}">
                                <label for="password" class="${properties.kcLabelClass!}">
                                    ${msg("password")}
                                </label>
                            </div>
                            <div class="${properties.kcInputWrapperClass!}">
                                <input type="password" id="password" class="${properties.kcInputClass!}" name="password" autocomplete="new-password" />
                            </div>
                        </div>
                        <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('password-confirm',properties.kcFormGroupErrorClass!)}">
                            <div class="${properties.kcLabelWrapperClass!}">
                                <label for="password-confirm" class="${properties.kcLabelClass!}">
                                    ${msg("passwordConfirm")}
                                </label>
                            </div>
                            <div class="${properties.kcInputWrapperClass!}">
                                <input type="password" id="password-confirm" class="${properties.kcInputClass!}" name="password-confirm" />
                            </div>
                        </div>
                    </#if>
                    <#if recaptchaRequired??>
                        <div class="form-group">
                            <div class="${properties.kcInputWrapperClass!}">
                                <div class="g-recaptcha" data-size="compact" data-sitekey="${recaptchaSiteKey}"></div>
                            </div>
                        </div>
                    </#if>
                    <div class="${properties.kcFormGroupClass!}">
                        <div id="kc-form-options" class="${properties.kcFormOptionsClass!}">
                            <div class="${properties.kcFormOptionsWrapperClass!}">
                                <span id="backToLoginLink"><a href="${url.loginUrl}">
                                        ${msg("backToLogin")?no_esc}
                                    </a></span>
                            </div>
                        </div>
                        <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
                            <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}" type="submit" value="${msg("doRegister")}" />
                        </div>
                    </div>
                </form>
                <#elseif section=="socialProviders">
                    <#if realm.password && social?? && social.providers?has_content>
                        <div id="kc-social-providers" class="${properties.kcFormSocialAccountSectionClass!}">
                            <hr />
                            <h2>
                                ${msg("identity-provider-login-label")}
                            </h2>
                            <ul class="${properties.kcFormSocialAccountListClass!}
<#if social.providers?size gt 3>
${properties.kcFormSocialAccountListGridClass!}
</#if>">
                                <#list social.providers as p>
                                    <li>
                                        <a id="social-${p.alias}" class="${properties.kcFormSocialAccountListButtonClass!}
<#if social.providers?size gt 3>
${properties.kcFormSocialAccountGridItem!}
</#if>" type="button" href="${p.loginUrl}">
                                            <#if p.iconClasses?has_content>
                                                <i class="${properties.kcCommonLogoIdP!} ${p.iconClasses!}" aria-hidden="true"></i>
                                                <span class="${properties.kcFormSocialAccountNameClass!} kc-social-icon-text">
                                                    ${p.displayName!}
                                                </span>
                                                <#else>
                                                    <span class="${properties.kcFormSocialAccountNameClass!}">
                                                        ${p.displayName!}
                                                    </span>
                                            </#if>
                                        </a>
                                    </li>
                                </#list>
                            </ul>
                        </div>
                    </#if>
        </#if>
        </@layout.registrationLayout>
        <script>
        (function() {
            function getClientIdFromUrl() {
                const searchParams = new URLSearchParams(window.location.search);
                if (searchParams.has("client_id")) {
                    return searchParams.get("client_id");
                }
                // Fallback: extract from hash
                const hashParams = new URLSearchParams(window.location.hash.substring(1));
                if (hashParams.has("client_id")) {
                    return hashParams.get("client_id");
                }
                return null;
            }
            const clientId = getClientIdFromUrl();
            const clientIdField = document.getElementById("clientId");
            if (clientIdField && clientId) {
                clientIdField.value = clientId;
            }
            if (clientId && clientId.includes("try-it-now-client")) {
                const backToLogin = document.getElementById("backToLoginLink");
                if (backToLogin) {
                    backToLogin.style.display = "none";
                }
            }
        })();
        </script>