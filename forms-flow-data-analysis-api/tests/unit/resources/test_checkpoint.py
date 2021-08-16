from api import create_app

def test_checkpoint_api():
    flask_app = create_app('flask_test.cfg')

    with flask_app.test_client() as client:
        response = client.get('/checkpoint')
        assert response.status_code == 200
        assert response.json == {"message": "Welcome to formsflow.ai Data Analysis API"}
