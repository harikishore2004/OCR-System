from sqlalchemy import create_engine, Integer, String, Column, TIMESTAMP, ForeignKey
from sqlalchemy.orm import sessionmaker, declarative_base

Database_URI = "postgresql+psycopg2://ocruser:ocrpass@localhost:5432/ocrdb"

engine = create_engine(Database_URI, echo=True)

SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)

Base = declarative_base()


"""
-- Table 1: File metadata
CREATE TABLE files (
    file_id TEXT PRIMARY KEY,
    filename TEXT NOT NULL,
    upload_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ocr_engine TEXT
);

-- Table 2: OCR line-wise results
CREATE TABLE ocr_results (
    id SERIAL PRIMARY KEY,
    file_id TEXT REFERENCES files(file_id) ON DELETE CASCADE,
    page_number INT,
    line_text TEXT,
    x INT,
    y INT,
    width INT,
    height INT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

"""

class Files(Base):
    __tablename__ = "files"
    id = Column(Integer, primary_key=True, autoincrement=True)
    filename = Column(String, nullable=False)
    upload_time = Column(TIMESTAMP, )
    
class OCR_Results(Base):
    __tablename__ = "ocr_results"
    id = Column(Integer, primary_key=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("files.id", ondelete="CASCADE"))
    page_number = Column(Integer)
    line_text = Column(String)
    x = Column(Integer)
    y = Column(Integer)
    width = Column(Integer)
    height = Column(Integer)
    timestamp = Column(TIMESTAMP)
    


def CreateTables():
    Base.metadata.create_all(bind=engine)