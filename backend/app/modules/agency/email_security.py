"""
Email Security & Token Encryption at Rest
Provides authenticated encryption for sensitive OAuth refresh tokens and credentials.
Never exposes plaintext credentials or tokens in application logs or to the frontend.
"""

import os
import hmac
import hashlib
import secrets
import base64
from typing import Optional
from app.core.config import settings


def _get_encryption_key() -> bytes:
    """
    Derives a 32-byte encryption key from TOKEN_ENCRYPTION_KEY or SECRET_KEY.
    """
    key_str = settings.TOKEN_ENCRYPTION_KEY or settings.SECRET_KEY or "default-ams-encryption-secret-key"
    return hashlib.sha256(key_str.encode("utf-8")).digest()


def encrypt_token(plain_token: Optional[str]) -> Optional[str]:
    """
    Encrypts a token at rest using PBKDF2-HMAC-SHA256 authenticated keystream (Encrypt-then-MAC).
    Returns an opaque, tamper-evident URL-safe base64 string.
    """
    if not plain_token:
        return None

    key = _get_encryption_key()
    salt = secrets.token_bytes(16)
    nonce = secrets.token_bytes(16)

    # Derive encryption key and MAC key from master key using PBKDF2
    derived = hashlib.pbkdf2_hmac("sha256", key, salt, 10000, dklen=64)
    enc_key = derived[:32]
    mac_key = derived[32:]

    data_bytes = plain_token.encode("utf-8")

    # Generate keystream blocks
    keystream = bytearray()
    counter = 0
    while len(keystream) < len(data_bytes):
        block = hmac.new(enc_key, nonce + counter.to_bytes(4, "big"), hashlib.sha256).digest()
        keystream.extend(block)
        counter += 1

    ciphertext = bytes(b ^ k for b, k in zip(data_bytes, keystream[:len(data_bytes)]))

    # Authenticate (salt + nonce + ciphertext) with HMAC-SHA256
    mac = hmac.new(mac_key, salt + nonce + ciphertext, hashlib.sha256).digest()

    payload = b"v1:" + salt + nonce + mac + ciphertext
    return base64.urlsafe_b64encode(payload).decode("ascii")


def decrypt_token(encrypted_token: Optional[str]) -> Optional[str]:
    """
    Decrypts an authenticated encrypted token.
    Validates HMAC tag before decryption to prevent padding and tampering attacks.
    """
    if not encrypted_token:
        return None

    try:
        raw = base64.urlsafe_b64decode(encrypted_token.encode("ascii"))
        if not raw.startswith(b"v1:"):
            return None

        body = raw[3:]
        if len(body) < 16 + 16 + 32:
            return None

        salt = body[:16]
        nonce = body[16:32]
        expected_mac = body[32:64]
        ciphertext = body[64:]

        key = _get_encryption_key()
        derived = hashlib.pbkdf2_hmac("sha256", key, salt, 10000, dklen=64)
        enc_key = derived[:32]
        mac_key = derived[32:]

        calculated_mac = hmac.new(mac_key, salt + nonce + ciphertext, hashlib.sha256).digest()
        if not hmac.compare_digest(calculated_mac, expected_mac):
            return None

        keystream = bytearray()
        counter = 0
        while len(keystream) < len(ciphertext):
            block = hmac.new(enc_key, nonce + counter.to_bytes(4, "big"), hashlib.sha256).digest()
            keystream.extend(block)
            counter += 1

        plaintext = bytes(c ^ k for c, k in zip(ciphertext, keystream[:len(ciphertext)]))
        return plaintext.decode("utf-8")
    except Exception:
        return None
