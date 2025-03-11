import asyncio
from typing import List
from sqlalchemy.sql import select
from src.db import webapi_db, bpmn_db
from src.graphql.schema import SubmissionSchema
from src.graphql.service import FormService

class SubmissionService:
        
    @staticmethod
    async def get_submissions(task_name: str, limit: int = 5) -> List[SubmissionSchema]:
        """
            Retrieve applications and their corresponding submission data based on a specified task name.

            This method performs the following operations:
            1. Fetches `process_instance_id` values from the `act_ru_task` table in the BPM database
            where the `name_` column matches the provided `task_name`.
            2. Retrieves records from the `application` table in the WebAPI database that have
            `process_instance_id` values matching those obtained in step 1, limited to the specified number.
            3. For each application record, fetches the corresponding submission data from formio database `submissions` table based on the `submission_id`.

            Parameters:
            -----------
            task_name : str
                The name of the task to filter `process_instance_id` values in the BPM database.
            limit : int, optional
                The maximum number of application records to retrieve (default is 5).

            Returns:
            --------
            List[SubmissionSchema]
                A list of `SubmissionSchema` instances, each containing:
                - id: The unique identifier of the application.
                - application_status: The status of the application.
                - task_name: The name of the task associated with the application.
                - data: The submission data corresponding to the application's `submission_id`.
        """
        application_table = await webapi_db.get_table("application")
        task_table = await bpmn_db.get_table("act_ru_task")

        webapi_session = await webapi_db.get_session()
        bpm_session = await bpmn_db.get_session()

        async with webapi_session as api_session, bpm_session as bpm_conn:
            # Fetch only the process_instance_ids that match the user-input task_name
            task_result = await bpm_conn.execute(
                select(task_table.c.proc_inst_id_).where(task_table.c.name_ == task_name)
            )
            process_instance_ids = [row["proc_inst_id_"] for row in task_result.mappings().all()]

            if not process_instance_ids:
                return []  # No matching tasks, return empty list

            # Fetch applications that have a matching process_instance_id, limited by the specified number
            application_result = await api_session.execute(
                select(application_table)
                .where(application_table.c.process_instance_id.in_(process_instance_ids))
                .limit(limit)
            )
            applications = application_result.mappings().all()

        # Fetch submission data in parallel using asyncio.gather
        submission_tasks = [
            FormService.get_submissions(row["submission_id"]) if row["submission_id"] else None
            for row in applications
        ]
        submissions = await asyncio.gather(*submission_tasks)

        # Construct response
        return [
            SubmissionSchema(
                id=row["id"],
                application_status=row["application_status"],
                task_name=task_name,
                data=submissions[i]
            )
            for i, row in enumerate(applications)
        ]