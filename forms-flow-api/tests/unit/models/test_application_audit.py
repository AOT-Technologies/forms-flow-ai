"""Unit tests for Application Audit Model"""
from api.models import ApplicationHistory

def test_application_audit_creation():
    """Test Application History Model creation"""
    instance1 = ApplicationHistory(id=1, application_id=10, application_status="New",
                                    form_url="https://testsample.com/api/form/6100fae7ba5ac0627e9eefe6/submission/6101131fc325d44c1d846c13")
    assert instance1.id == 1
    assert instance1.form_url == "https://testsample.com/api/form/6100fae7ba5ac0627e9eefe6/submission/6101131fc325d44c1d846c13"
    
