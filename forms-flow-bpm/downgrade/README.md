# forms-flow-bpm downgrade

Camunda downgrade `7.15.0` to `7.13.0` includes db changes. Please run the [downgrade file](./process-engine_7.15_to_7.13.sql) after the `forms-flow-bpm-db` service is up.
 
 ### Steps to run the downgrade file

* Open a postgres client installed on your machine `eg: pgAdmin, Dbeaver etc`.
* Open the `Query Editor` to run `.sql` file.
* Copy and paste the [downgrade file](./process-engine_7.15_to_7.13.sql).
* Click on `Run` icon to execute the script.
