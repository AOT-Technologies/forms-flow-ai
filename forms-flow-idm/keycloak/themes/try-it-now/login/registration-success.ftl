<#import "template.ftl" as layout>
  <@layout.registrationLayout>
    <#-- ${msg(registrationCustomSuccessMsg)} -->
      <script>
      // Clear any session data
      localStorage.removeItem('keycloak-auth-state');
      </script>
  </@layout.registrationLayout>