from .DataBaseSchema import Logs
from sqlalchemy.orm import Session
from uuid import UUID
import datetime

class Logger:
    def __init__(self, file_name: str):
        self.file_name = file_name
        self.logs: list[Logs] = []
        
    def AddLog(self, db: Session, function_name: str, status: str, message: str):
        
        log = Logs(
            file_name = self.file_name,
            function_name = function_name,
            status = status,
            message = message,
            time_stamp = datetime.datetime.now()
        )
        
        self.logs.append(log)
        
    def CommitLogs(self, db: Session):
        for log in self.logs:
            db.add(log)
        db.commit()
        self.logs.clear()