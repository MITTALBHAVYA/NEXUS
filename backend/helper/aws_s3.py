import os
import boto3
from botocore.exceptions import NoCredentialsError
from logger import logger
from config import Config
from botocore.exceptions import ClientError

s3_client = boto3.client("s3", region_name=Config.AWS_REGION_NAME)
bucket_name = Config.AWS_BUCKET_NAME


def upload_to_s3(file_path, bucket_path=None):
    try:
        s3_file_name = file_path.split("/")[-1] if bucket_path is None else bucket_path
        s3_client.upload_file(
            file_path, bucket_name, s3_file_name, ExtraArgs={"ACL": "public-read"}
        )
        logger.info("Upload Successful")
        return True
    except FileNotFoundError:
        logger.info("The file was not found")
        return False
    except NoCredentialsError:
        logger.info("Credentials not available")
        return False


def upload_obj_to_s3(file, file_name, bucket_path=None):
    try:
        bucket = Config.AWS_BUCKET_NAME
        s3_client.upload_fileobj(
            file,
            bucket,
            bucket_path + "/" + file_name,
            # ExtraArgs={"ACL": "public-read"},
        )
        logger.info("Upload Successful")
        return get_s3_obj_url(bucket_path + "/" + file_name)
    except FileNotFoundError:
        logger.info("The file was not found")
        return None
    except NoCredentialsError:
        logger.info("Credentials not available")
        return None


def download_from_s3(s3_file_name, output_path=None):
    file_name = s3_file_name.split("/")[-1]
    file_path = (
        os.getcwd() + f"/tmp/output/{file_name}" if output_path is None else output_path
    )

    try:
        s3_client.download_file(bucket_name, s3_file_name, file_path)
        logger.info("Download Successful")
        return True
    except ClientError as e:
        logger.error(f"An error occurred: {e}")
        if e.response["Error"]["Code"] == "404":
            logger.error(f"File not found in S3 bucket: {file_path}")
        else:
            logger.error(f"An error occurred: {e}")
        return False
    except FileNotFoundError:
        logger.info("The file was not found")
        return False
    except NoCredentialsError:
        logger.info("Credentials not available")
        return False


def check_file_exists(file_path):
    try:
        s3_client.head_object(Bucket=bucket_name, Key=file_path)
        return True
    except Exception as e:
        logger.error(f"file not found in s3 bucket: {file_path} due to {e}")
        return False


def get_s3_obj_url(file_path):
    return f"https://{Config.AWS_BUCKET_NAME}.s3.{Config.AWS_REGION_NAME}.amazonaws.com/{file_path}"

def delete_s3_obj(file_path):
    try:
        s3_client.delete_object(Bucket=bucket_name, Key=file_path)
        logger.info(f"Deleted file: {file_path}")
        return True
    except Exception as e:
        logger.error(f"file not found in s3 bucket: {file_path} due to {e}")
        return False