"""Keycloak token Handler."""

from typing import Any, Dict

import httpx
import jwt
from cachelib import SimpleCache
from jwt import PyJWK
from jwt.exceptions import PyJWTError

from src.utils.logger import get_logger

logger = get_logger("KeycloakOIDC")
# pylint: disable=too-few-public-methods


class KeycloakOIDC:
    """Keycloak token Handler"""

    def __init__(
        self, jwks_url: str, audience: str, issuer: str, cache_expiry: int = 3600
    ):
        self.jwks_url = jwks_url
        self.audience = audience
        self.issuer = issuer
        self.cache_expiry = cache_expiry  # In seconds (default: 1 hour)
        self.cache = SimpleCache(default_timeout=self.cache_expiry)

    async def __fetch_keys(self) -> Dict[str, Any]:
        """Fetch JWKS keys from Keycloak."""
        try:
            logger.info("Fetching Public key of keycloak")
            async with httpx.AsyncClient() as client:
                response = await client.get(self.jwks_url, timeout=5)
                response.raise_for_status()
                jwks = response.json()
            logger.info("Got response form keycloak [public key]")
            keys = jwks.get("keys", [])
            # Filter only signing keys with RS256
            # Cache the raw JWK dicts (picklable) rather than constructed key
            # objects, since cachelib pickles cached values and the
            # cryptography-backed key objects PyJWK produces are not picklable.
            signing_keys = {
                key["kid"]: key
                for key in keys
                if key.get("use") == "sig"
                and key.get("alg") == "RS256"
                and key.get("kid")
            }
            return signing_keys
        except Exception as e:
            raise RuntimeError(f"Failed to fetch Keycloak public keys: {str(e)}") from e

    async def __get_public_keys(self) -> Dict[str, Any]:
        """Retrieve public keys from cache or fetch if not present."""
        public_keys = self.cache.get("public_keys")
        if public_keys is None:
            public_keys = await self.__fetch_keys()
            self.cache.set("public_keys", public_keys)
        return public_keys

    async def verify_token(self, token: str) -> Dict[str, Any]:
        """Verify the JWT token and return the payload if valid."""
        public_keys = await self.__get_public_keys()
        try:
            logger.info("Token Verification started")
            headers = jwt.get_unverified_header(token)
            kid = headers.get("kid")
            if not kid or kid not in public_keys:
                # Force refresh keys if kid not found (possible key rotation)
                public_keys = await self.__fetch_keys()
                self.cache.set("public_keys", public_keys)
                kid = headers.get("kid")
                if not kid or kid not in public_keys:
                    raise PyJWTError("Public key not found for 'kid'")
            public_key = PyJWK(public_keys[kid]).key
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=self.audience,
                issuer=self.issuer,
            )
            logger.info("Token Verification completed")
            return payload
        except PyJWTError as e:
            raise PyJWTError(f"Invalid Token: {str(e)}") from e
