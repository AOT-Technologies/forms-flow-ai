<#import "template.ftl" as layout>
  <@layout.registrationLayout>
    <script>
    // Clear any session data
    localStorage.removeItem('keycloak-auth-state');
    </script>
  </@layout.registrationLayout>