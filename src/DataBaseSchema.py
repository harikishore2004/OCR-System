from sqlalchemy import create_engine, Integer, String, Column, TIMESTAMP, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base
import os

Database_URI = os.getenv("DATABASE_URL")

engine = create_engine(Database_URI, echo=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()

class Files(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_name = Column(String, nullable=False)
    page_count = Column(Integer, nullable=False)
    engine = Column(String, nullable=False)
    upload_time = Column(TIMESTAMP,nullable=False )
    
class OCR_Results(Base):
    __tablename__ = "ocr_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_name = Column(String, nullable=False)
    file_id = Column(Integer, ForeignKey("files.id", ondelete="CASCADE"))
    page_number = Column(Integer, nullable=False)
    line_text = Column(String)
    x = Column(Integer)
    y = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    timestamp = Column(TIMESTAMP)
    


def CreateTables():
    Base.metadata.create_all(bind=engine)