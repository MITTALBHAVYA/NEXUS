import bcrypt


def get_hashed_password(password: str) -> bytes:
    """
    Hash a password for the first time.

    Args:
        password (str): The password to be hashed.

    Returns:
        bytes: The hashed password.
    """
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())


def verify_password(password: bytes, hashed_password: bytes) -> bool:
    """
    Check hashed password. Using bcrypt, the salt is saved into the hash itself.

    Args:
        password (bytes): The password to be verified.
        hashed_password (bytes): The hashed password to compare against.

    Returns:
        bool: True if the password matches the hashed password, False otherwise.
    """
    return bcrypt.checkpw(password, hashed_password)
