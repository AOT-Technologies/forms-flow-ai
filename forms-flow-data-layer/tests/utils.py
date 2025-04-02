import time
from base64 import urlsafe_b64encode
from typing import Dict, Optional

import rsa
from jose import jwt


class KeycloakTestTokenGenerator:
    """Generates test tokens that match KeycloakOIDC verification requirements"""

    def __init__(
        self,
        issuer: str,
        audience: str,
        kid: str = "oTRqtPuhJZ5R6N-AYYF79I17DWTKZT78xUzG0gLaDTw",
        algorithm: str = "RS256"
    ):
        self.issuer = issuer
        self.audience = audience
        self.kid = kid
        self.algorithm = algorithm

        # Generate RSA key pair
        (self.public_key, self.private_key) = rsa.newkeys(2048)

        # Prepare JWKS
        self.public_jwk = self._get_public_jwk()

    def _int_to_base64(self, value: int) -> str:
        """Convert integer to Base64URL encoded string"""
        byte_length = (value.bit_length() + 7) // 8
        bytes_value = value.to_bytes(byte_length, byteorder='big')
        return urlsafe_b64encode(bytes_value).decode('utf-8').rstrip("=")

    def _get_public_jwk(self) -> Dict:
        """Get public key in JWKS format for testing"""
        return {
            "kty": "RSA",
            "kid": self.kid,
            "use": "sig",
            "alg": self.algorithm,
            "n": self._int_to_base64(self.public_key.n),
            "e": self._int_to_base64(self.public_key.e)
        }

    def get_test_jwks(self) -> Dict:
        """Return JWKS format for testing KeycloakOIDC"""
        return {"keys": [self.public_jwk]}

    def generate_test_token(
        self,
        subject: str = "test-user",
        roles: Optional[list] = ["manage_tasks"],
        exp_minutes: int = 60,
        tenant_key: str = None,
        **custom_claims
    ) -> str:
        """Generate a test JWT token"""
        current_time = int(time.time())

        payload = {
            "jti": "test-jti-" + str(current_time),
            "iss": self.issuer,
            "aud": self.audience,
            "sub": subject,
            "typ": "Bearer",
            "azp": "test-client",
            "preferred_username": subject,
            "email": f"{subject}@test.com",
            "iat": current_time,
            "exp": current_time + (exp_minutes * 60),
            "scope": "camunda-rest-api email profile",
            "allowed-origins": ["*"],
            "realm_access": {
                "roles": ["offline_access", "uma_authorization"]
            },
            "resource_access": {
                "forms-flow-web": {"roles": [*roles]},
                "account": {
                    "roles": ["manage-account", "view-profile"]
                }
            },
            "roles": [*roles],
            "name": "Test user",
            "given_name": "Test",
            "family_name": "Test",
            "tenantKey": tenant_key,
            **custom_claims
        }

        headers = {
            "alg": self.algorithm,
            "typ": "JWT",
            "kid": self.kid
        }

        # Convert private key to PEM format
        private_key_pem = self.private_key.save_pkcs1().decode('utf-8')

        return jwt.encode(
            payload,
            private_key_pem,
            algorithm=self.algorithm,
            headers=headers
        )
