def test_checkpoint_api(session, client, app):
    rv = client.get("/checkpoint")
    assert rv.status_code == 200
