from api import create_app

def test_checkpoint_api():
    flask_app = create_app(run_mode='testing')

    with flask_app.test_client() as client:
        response = client.get('/checkpoint')
        assert response.status_code == 200
        assert response.json == {"message": "Welcome to formsflow.ai Data Analysis API"}

def test_checkpoint_test_api(client):
    response = client.get('/checkpoint')
    assert response.status_code == 200
    assert response.json is not None
