from sqlalchemy.orm import Session
from db.models.customer import Customer
from helper.security import get_hashed_password, verify_password
from datetime import datetime


class CustomerQuery:
    """
    A class that contains methods for querying the Customer table in the database.
    """

    @staticmethod
    def create_customer(db: Session, name: str, email: str, password: str):
        """
        Creates a new customer in the database.

        Args:
            db (Session): The database session.
            name (str): The name of the customer.
            email (str): The email of the customer.
            password (str): The password of the customer.

        Returns:
            Customer: The created customer object.
        """
        hashed_password = get_hashed_password(password)
        customer = Customer(name=name, email=email, password=hashed_password)
        db.add(customer)
        db.flush()

        return customer

    @staticmethod
    def get_customer_by_email(db: Session, email: str):
        """
        Retrieves a customer from the database by email.

        Args:
            db (Session): The database session.
            email (str): The email of the customer.

        Returns:
            Customer: The customer object if found, None otherwise.
        """
        return db.query(Customer).filter(Customer.email == email).first()

    @staticmethod
    def get_customer_by_uuid(db: Session, uuid: str)-> Customer:
        """
        Retrieves a customer from the database by UUID.

        Args:
            db (Session): The database session.
            uuid (str): The UUID of the customer.

        Returns:
            Customer: The customer object if found, None otherwise.
        """
        return db.query(Customer).filter(Customer.uuid == uuid).first()

    @staticmethod
    def get_customer_by_email_password(db: Session, email: str, password: str):
        """
        Retrieves a customer from the database by email and verifies the password.

        Args:
            db (Session): The database session.
            email (str): The email of the customer.
            password (str): The password of the customer.

        Returns:
            Customer: The customer object if found and password is correct, None otherwise.
        """
        customer = CustomerQuery.get_customer_by_email(db, email)
        if not customer:
            return None

        if not verify_password(password.encode("utf-8"), customer.password):
            return None

        return customer

    @staticmethod
    def update_customer_last_login(db: Session, customer: Customer):
        """
        Updates the last login timestamp of a customer in the database.

        Args:
            db (Session): The database session.
            customer (Customer): The customer object.

        Returns:
            Customer: The updated customer object.
        """
        customer.last_login = datetime.utcnow()
        db.commit()
        return customer
    
    @staticmethod
    def update_customer_profile(db: Session, uuid: str, name: str=None):
        """
        Updates the profile of a customer in the database.

        Args:
            db (Session): The database session.
            uuid (str): The UUID of the customer.
            name (str): The name of the customer.

        Returns:
            Customer: The updated customer object.
        """
        customer = CustomerQuery.get_customer_by_uuid(db, uuid)
        if name:
            customer.name = name
        db.flush()
        return customer
    
