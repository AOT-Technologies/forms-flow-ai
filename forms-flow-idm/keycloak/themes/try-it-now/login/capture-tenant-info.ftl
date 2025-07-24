<#import "template.ftl" as layout>
  <@layout.registrationLayout; section>
    <#if section=="header">
      ${msg("captureTenantInfoHeader")!''}
      <#elseif section=="form">
        <form action="${url.loginAction}" method="post">
          <div class="${properties.kcFormGroupClass!}">
            <label for="tenantName" class="${properties.kcLabelClass!}">
              ${msg("tenantName")}
            </label>
            <input type="text" id="tenantName" name="tenantName"
              class="${properties.kcInputClass!}" value="${tenantName!""}" />
          </div>
          <div class="${properties.kcFormGroupClass!}">
            <label for="tenantKey" class="${properties.kcLabelClass!}">
              ${msg("tenantKey")}
            </label>
            <input type="text" id="tenantKey" name="tenantKey"
              class="${properties.kcInputClass!}" value="${tenantKey!""}" />
          </div>
          <div class="${properties.kcFormGroupClass!}">
            <div id="kc-form-buttons" class="${properties.kcFormButtonsClass!}">
              <input class="${properties.kcButtonClass!} ${properties.kcButtonPrimaryClass!} ${properties.kcButtonBlockClass!} ${properties.kcButtonLargeClass!}"
                type="submit" value="${msg("submit")!}" />
            </div>
          </div>
        </form>
    </#if>
    </@layout.registrationLayout>