# forms-flow-bpm Upgrade

The below given dependencies are upgraded to the latest as part of this upgrade.

   Dependency name | Old version | New version | Description |
 --- | --- | --- | ---
 `camunda-bpm-identity-keycloak` | `2.0.0` | `2.2.1` | Camunda keycloak identity provider upgrade
 `camunda` | `7.13.0` | `7.15.0` | Camunda version upgrade
  `springboot` | `2.4.2` | `2.4.8` | Springboot upgrade
  `spring-security-oauth2` | `2.4.2` | `2.4.8` | Oauth2 upgrade
 
 
 Since camunda upgrade `7.13.0` to `7.15.0` includes db changes. Please run the [upgrade file](./process-engine_7.13_to_7.15.sql) after the `forms-flow-bpm-db` service is up.
 
 ### Steps to run the upgrade file

* Open a postgres client installed on your machine `eg: pgAdmin, Dbeaver etc`.
* Open the `Query Editor` to run `.sql` file.
* Copy and paste the [upgrade file](./process-engine_7.13_to_7.15.sql).
* Click on `Run` icon to execute the script.
