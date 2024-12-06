from loguru import logger as loguru_logger


logger = loguru_logger

logger.add("./logs/debug_log_file.log", format="{time} {level} {module} {file.path}:{line} {message}",
           level="DEBUG", backtrace=True, retention="90 days")

logger.add("./logs/info_log_file.log", format="{time} {level} {module} {file.path}:{line} {message}",
           level="INFO", backtrace=True, retention="90 days")