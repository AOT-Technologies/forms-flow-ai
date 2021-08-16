"""Unit tests for application Model"""
from api.models import Application

def test_application_model_can_create_application(db):
    """Test application model can create application."""
    application1 = Application(application_name='Test Form Application',
                            application_status='Approved',
                            form_url="https://app2.aot-technologies.com/form/123/submission/2313",
                            process_instance_id="213123",
                            revision_no=1,
                            form_process_mapper_id=1)
    
    assert application1.application_name == 'Test Form Application'
    assert application1.application_status == 'Approved'
    assert application1.form_url == "https://app2.aot-technologies.com/form/123/submission/2313"
