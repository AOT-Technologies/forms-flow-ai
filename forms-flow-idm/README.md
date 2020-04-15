# Keycloak Configuration
`Forms Flow.AI` framework can be hooked up with any OpenID Connect compliant Identity Management Server. A typical security model referenced in the current solution is illustrated below assuming *Keycloak* as the identity and access management server.

Use Case considered
---------
A staff user with form designer role is able to create and publish form.io based forms. When an authenricated end user (client) submits a form, staff users with reviewer role can approve or reject the submission

Keycloak setup
----------
- Create a realm with appropriate naming convention of choice, say `forms-flow-ai`
- Create 2 clients `forms-flow-bpm` and `forms-flow-web`
- Add following 4 roles for the application management of client `forms-flow-web` (in this example `acme` is the application  that is being configured)
  * `acme`
  * `acme-formsdesigner`
  * `acme-reviewer`
  * `acme-client`
- Add following groups and subgroups for easy mapping and management of user privileges. For this purpose, application needs necessary management of groups. And then roles needs to be assigned to groups created. 
  * `camunda-admin` (Default group of process-engine `forms-flow-ai`)
    * `acme-reviewer`  (Subgroup under main group “camunda-admin”.
  * `acme`
    * `acme-client` - Mapped with application role `acme-client`
    * `acme-designer` - Mapped with application role `acme-formsdesigner`
    * `acme-reviewer` - Mapped with application role `acme-reviewer`
- Add following users to the appplication.
  * `acme-user-client` - Member of `acme-client`
  * `acme-user-designer` - Member of `acme-designer`
  * `acme-user-reviewer` - Member of `acme-reviewer`
  * `bpm-admin` - Member of `camunda-admin`
  * `forms-flow-admin` - Realm Admin
