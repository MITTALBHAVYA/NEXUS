from sqlalchemy.orm import Session
from db.models.db_config import DBConfig
from db.models.chat_history import ChatHistory


class DBConfigQuery:
    @staticmethod
    def create_db_config(
        db: Session, customer_uuid: str, db_type: str, db_config: dict
    ) -> DBConfig:
        """
        Create a new DBConfig object and add it to the database.

        Args:
            db (Session): The SQLAlchemy session object.
            customer_uuid (str): The UUID of the customer.
            db_type (str): The type of the database.
            db_config (dict): The configuration details of the database.

        Returns:
            DBConfig: The newly created DBConfig object.
        """
        db_config = DBConfig(
            customer_uuid=customer_uuid, db_type=db_type, db_config=db_config
        )
        db.add(db_config)
        db.flush()
        return db_config

    @staticmethod
    def get_db_config_by_customer_uuid(db: Session, customer_uuid: str):
        """
        Retrieve all DBConfig objects associated with a specific customer UUID.

        Args:
            db (Session): The SQLAlchemy session object.
            customer_uuid (str): The UUID of the customer.

        Returns:
            List[DBConfig]: A list of DBConfig objects associated with the customer UUID.
        """
        data = (
            db.query(DBConfig).with_entities(
                DBConfig.id,
                DBConfig.customer_uuid,
                DBConfig.db_type,
                DBConfig.db_config,
                ChatHistory.uuid.label("chat_uuid"),
                DBConfig.created_at,
                DBConfig.updated_at,
            )
            .filter(DBConfig.customer_uuid == customer_uuid, ChatHistory.query_type == "db")
            .join(ChatHistory, ChatHistory.data_source_id == DBConfig.id)
            .all()
        )
        dict_data = [
            {
                "id": d.id,
                "customer_uuid": d.customer_uuid,
                "db_type": d.db_type,
                "db_name":d.db_config.get("dbname"),
                "chat_uuid": d.chat_uuid,
                "created_at": d.created_at,
                "updated_at": d.updated_at,
            }
            for d in data
        ]
        return dict_data

    @staticmethod
    def get_db_config_by_id(db: Session, db_id: int, customer_uuid: str = None):
        """
        Retrieve a DBConfig object by its ID.

        Args:
            db (Session): The SQLAlchemy session object.
            db_id (int): The ID of the DBConfig object.

        Returns:
            DBConfig: The DBConfig object with the specified ID.
        """
        if customer_uuid:
            return (
                db.query(DBConfig)
                .filter(DBConfig.id == db_id, DBConfig.customer_uuid == customer_uuid)
                .first()
            )
        return db.query(DBConfig).filter(DBConfig.id == db_id).first()

    @staticmethod
    def delete_db_config_by_id(db: Session, db_id: int):
        """
        Delete a DBConfig object by its ID.

        Args:
            db (Session): The SQLAlchemy session object.
            db_id (int): The ID of the DBConfig object to delete.
        """
        try:
            db.query(DBConfig).filter(DBConfig.id == db_id).delete()
            db.flush()
        except Exception as e:
            return False
        return True

    @staticmethod
    def update_db_config_by_id(
        db: Session, db_id: int, db_type: str = None, db_config: dict = None
    ):
        """
        Update a DBConfig object by its ID.

        Args:
            db (Session): The SQLAlchemy session object.
            db_id (int): The ID of the DBConfig object to update.
            db_type (str): The type of the database.
            db_config (dict): The configuration details of the database.
        """
        try:
            db_config_obj = db.query(DBConfig).filter(DBConfig.id == db_id).first()
            if db_type:
                db_config_obj.db_type = db_type
            if db_config:
                db_config_obj.db_config = db_config
            db.flush()
        except Exception as e:
            return None
        return db_config_obj
