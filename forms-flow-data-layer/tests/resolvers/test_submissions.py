import pytest
import datetime
import uuid
from bson import ObjectId
from sqlalchemy import insert, delete
from src.graphql.service import SubmissionService
from src.graphql.schema.submission_schema import SubmissionSchema


@pytest.mark.asyncio
async def test_get_submissions_with_data(async_webapi_db, async_bpm_db, async_formio_db):
    """
    Unit test for SubmissionService.get_submissions with dummy data valid response.
    """
    # Retrieve the reflected tables
    application_table = await async_webapi_db.get_table("application")
    mapper_table = await async_webapi_db.get_table("form_process_mapper")
    task_table = await async_bpm_db.get_table("act_ru_task")
    process_def_table = await async_bpm_db.get_table("act_re_procdef")
    process_instance_table = await async_bpm_db.get_table("act_ru_execution")

    # Generate unique values
    proc_inst_id = str(uuid.uuid4())
    name = "testflow15"
    process_def_id = name + str(uuid.uuid4())
    task_id = str(uuid.uuid4())  # Unique task ID

    # Initialize IDs to None to prevent UnboundLocalError
    form_id = None
    submission_id = None
    form_process_mapper_id = None

    # Get database sessions
    session_api = await async_webapi_db.get_session()
    session_bpm = await async_bpm_db.get_session()

    try:
        async with session_api as api_session, session_bpm as bpm_session:
            # Insert necessary records into BPM database
            # Task table depends data from process definition, process instance which is found in  act_re_procdef, act_ru_execution tables
            await bpm_session.execute(
                insert(process_def_table).values(
                    id_=process_def_id, name_=name, key_=name, version_=1
                )
            )
            await bpm_session.execute(
                insert(process_instance_table).values(
                    id_=proc_inst_id, proc_inst_id_=proc_inst_id, proc_def_id_=process_def_id
                )
            )
            await bpm_session.execute(
                insert(task_table).values(
                    proc_inst_id_=proc_inst_id, name_="Test Task", proc_def_id_=process_def_id, id_=task_id
                )
            )
            await bpm_session.commit()

            # Insert dummy form data into MongoDB
            form_data = {
                "title": name, "name": name, "path": name, "machineName": name,
                "components": [{"type": "name", "key": "name", "label": "Name", "inputType": "name"}]
            }
            form_insert_result = await async_formio_db["forms"].insert_one(form_data)
            form_id = str(form_insert_result.inserted_id)
            # Insert dummy submission data into MongoDB
            submission_data = {"form": form_id, "data": {"name": "testuser"}}
            submission_insert_result = await async_formio_db["submissions"].insert_one(submission_data)
            submission_id = str(submission_insert_result.inserted_id)
            # Insert records into WebAPI database
            # Inser data into form_process_mapper and application tables
            result = await api_session.execute(
                insert(mapper_table).values(
                    form_id=form_id, parent_form_id=form_id, form_name=name, process_key=name, form_type="form",
                    process_name=name, status="active", created=datetime.datetime.now(), created_by="test-user"
                ).returning(mapper_table.c.id)
            )
            form_process_mapper_id = result.scalar()
            await api_session.execute(
                insert(application_table).values(
                    process_instance_id=proc_inst_id, submission_id=submission_id, application_status="pending",
                    created=datetime.datetime.now(), created_by="test-user",
                    form_process_mapper_id=form_process_mapper_id, latest_form_id=form_id
                )
            )
            await api_session.commit()

        # Call the method under test
        submissions = await SubmissionService.get_submissions("Test Task", limit=5)

        # Assert
        assert len(submissions) == 1
        assert isinstance(submissions[0], SubmissionSchema)
        assert submissions[0].application_status == "pending"
        assert submissions[0].task_name == "Test Task"
        assert submissions[0].data == submission_data["data"]

    finally:
        # Clean up only the specific test data
        async with session_api as api_session, session_bpm as bpm_session:
            if submission_id:
                await api_session.execute(
                    delete(application_table).where(application_table.c.submission_id == submission_id)
                )
            if form_process_mapper_id:
                await api_session.execute(
                    delete(mapper_table).where(mapper_table.c.id == form_process_mapper_id)
                )
            await api_session.commit()

            # Delete only the created task, process instance, and process definition records
            await bpm_session.execute(
                delete(task_table).where(task_table.c.id_ == task_id)
            )
            await bpm_session.execute(
                delete(process_instance_table).where(process_instance_table.c.id_ == proc_inst_id)
            )
            await bpm_session.execute(
                delete(process_def_table).where(process_def_table.c.id_ == process_def_id)
            )
            await bpm_session.commit()
        # Delete only the created form and submission data from MongoDB
        if submission_id:
            await async_formio_db["submissions"].delete_one({"_id": ObjectId(submission_id)})

        if form_id:
            await async_formio_db["forms"].delete_one({"_id": ObjectId(form_id)})


@pytest.mark.asyncio
async def test_get_submissions_with_empty_response(async_webapi_db, async_bpm_db, async_formio_db):
    """
    Unit test for SubmissionService.get_submissions with empty response.
    """
    # Call the method under test
    submissions = await SubmissionService.get_submissions("Test Task", limit=5)

    # Assert
    assert len(submissions) == 0
