# """This exposes formIO token service."""

# import datetime
# import os

# import jwt

# from ..models.formio_token import FormIOToken


# class FormIOTokenService:
#     """This class manages application service."""

#     @staticmethod
#     def get_formio_token():
#         """Get formio token."""
#         # userDetails = get_token_details()
#         formio_token = FormIOTokenService.generate_formio_token()
#         new_formiotoken = FormIOToken(
#             keycloak_role="userDetails['given_name']",
#             formio_token=formio_token,
#             formio_role="",
#             created=datetime.datetime.utcnow(),
#         )
#         new_formiotoken.save()
#         return FormIOToken.query.last()

#     @staticmethod
#     def generate_formio_token():
#         """Generate Auth Token.

#         :return: string
#         """
#         try:
#             sec_key = os.getenv("SECRET_KEY")
#             payload = {
#                 "form": {"_id": "5e8eb76190b24438847463c8"},
#                 "user": {"_id": "anonymous", "roles": ["5e8eb76190b24438847463c7"]},
#             }

#             auth_key = jwt.encode(payload, sec_key, algorithm="HS256")
#             return auth_key

#         except Exception as e:
#             return e
