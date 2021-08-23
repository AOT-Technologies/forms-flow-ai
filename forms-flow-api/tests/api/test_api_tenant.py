# """Tests the tenant endpoint."""

# from http import HTTPStatus


# def test_get_tenants(client, session):
#     """Assert get tenants success."""
#     response = client.get('/tenant', content_type='application/json')
#     assert response.status_code == HTTPStatus.OK


# def test_get_tenant_by_id_exception(client, session):
#     """Assert get tenant by id exception."""
#     response = client.get('/tenant/1234', content_type='application/json')
#     assert response.status_code == HTTPStatus.BAD_REQUEST
