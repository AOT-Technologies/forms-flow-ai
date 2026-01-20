"""Keycloak token Handler."""

from typing import Any, Dict

import httpx
from cachelib import SimpleCache
from jose import JWTError, jwk, jwt

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
            return jwks
        except Exception as e:
            raise RuntimeError(f"Failed to fetch Keycloak public keys: {str(e)}") from e

    async def __get__signing_keys(self, public_keys) -> Dict[str, Any]:
        """Retrieving signing public keys from the public keys."""
        keys = public_keys.get("keys", [])
        signing_public_keys = {
            key["kid"]: jwk.construct(key)
            for key in keys
            if key.get("use") == "sig" and key.get("alg") == "RS256" and key.get("kid")
        }
        return signing_public_keys

    async def __get_public_keys(self) -> Dict[str, Any]:
        """Retrieve public keys from cache or fetch if not present."""
        public_keys = self.cache.get("public_keys")
        if public_keys is None:
            public_keys = await self.__fetch_keys()
            self.cache.set("public_keys", public_keys)
        signing_keys = await self.__get__signing_keys(public_keys)
        return signing_keys

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
                public_keys = await self.__get__signing_keys(public_keys)
                if not kid or kid not in public_keys:
                    raise JWTError("Public key not found for 'kid'")
            public_key = public_keys[kid]
            payload = jwt.decode(
                token,
                public_key,
                algorithms=["RS256"],
                audience=self.audience,
                issuer=self.issuer,
            )
            logger.info("Token Verification completed")
            return payload
        except JWTError as e:
            raise JWTError(f"Invalid Token: {str(e)}") from e
