<#import "template.ftl" as layout>
    <@layout.registrationLayout; section>
        <#if section=="header">
            ${msg("registerTitle")}
            <#elseif section=="form">
                <form id="kc-register-form"
                    class="${properties.kcFormClass!}"
                    action="${url.registrationAction}" method="post" novalidate>
                    <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('firstName',properties.kcFormGroupErrorClass!)}">
                        <div class="${properties.kcLabelWrapperClass!}">
                            <label for="firstName" class="${properties.kcLabelClass!}">
                                ${msg("firstName")}
                            </label>
                        </div>
                        <div class="${properties.kcInputWrapperClass!}">
                            <input type="text" id="firstName" class="${properties.kcInputClass!}" name="firstName" value="${(register.formData.firstName!'')}" required />
                        </div>
                    </div>
                    <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('lastName',properties.kcFormGroupErrorClass!)}">
                        <div class="${properties.kcLabelWrapperClass!}">
                            <label for="lastName" class="${properties.kcLabelClass!}">
                                ${msg("lastName")}
                            </label>
                        </div>
                        <div class="${properties.kcInputWrapperClass!}">
                            <input type="text" id="lastName" class="${properties.kcInputClass!}" name="lastName" value="${(register.formData.lastName!'')}" required />
                        </div>
                    </div>
                    <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('email',properties.kcFormGroupErrorClass!)}">
                        <div class="${properties.kcLabelWrapperClass!}">
                            <label for="email" class="${properties.kcLabelClass!}">
                                ${msg("email")}
                            </label>
                        </div>
                        <div class="${properties.kcInputWrapperClass!}">
                            <input type="email" id="email" class="${properties.kcInputClass!}" name="email" value="${(register.formData.email!'')}" autocomplete="email" required />
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
                                <input type="text" id="username" class="${properties.kcInputClass!}" name="username" value="${(register.formData.username!'')}" autocomplete="username" required />
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
                                <input type="password" id="password" class="${properties.kcInputClass!}" name="password" autocomplete="new-password" required />
                            </div>
                        </div>
                        <div class="${properties.kcFormGroupClass!} ${messagesPerField.printIfExists('password-confirm',properties.kcFormGroupErrorClass!)}">
                            <div class="${properties.kcLabelWrapperClass!}">
                                <label for="password-confirm" class="${properties.kcLabelClass!}">
                                    ${msg("passwordConfirm")}
                                </label>
                            </div>
                            <div class="${properties.kcInputWrapperClass!}">
                                <input type="password" id="password-confirm" class="${properties.kcInputClass!}" name="password-confirm" required />
                            </div>
                        </div>
                        <!-- Tenant fields block for try-it-now client -->
                        <div id="tryItNowFields">
                            <div class="${properties.kcFormGroupClass!}">
                                <div class="${properties.kcLabelWrapperClass!}">
                                    <label for="tenantName" class="${properties.kcLabelClass!}">
                                        ${msg("tenantName")}
                                    </label>
                                </div>
                                <div class="${properties.kcInputWrapperClass!}">
                                    <input type="text" id="tenantName" name="tenantName"
                                        class="${properties.kcInputClass!}"
                                        value="${register.formData.tenantName?default('')}"
                                        required />
                                </div>
                            </div>
                            <div class="${properties.kcFormGroupClass!}">
                                <div class="${properties.kcLabelWrapperClass!}">
                                    <label for="tenantKey" class="${properties.kcLabelClass!}">
                                        ${msg("tenantKey")}
                                    </label>
                                </div>
                                <div class="${properties.kcInputWrapperClass!}">
                                    <input type="text" id="tenantKey" name="tenantKey"
                                        class="${properties.kcInputClass!}"
                                        value="${register.formData.tenantKey?default('')}"
                                        pattern="^\\S+$"
                                        title="Tenant Key must not contain spaces."
                                        required />
                                </div>
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
</#if>"
                                            type="button" href="${p.loginUrl}">
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