from sqlalchemy.orm import Session
import datetime
from fastapi import HTTPException
from .DataBaseSchema import Files, OCR_Results

def InsertFile(db: Session, page_count: int, file_name: str, engine: str):
    try:
        new_file = Files(
            file_name = file_name,
            page_count = page_count,
            engine = engine,
            upload_time = datetime.datetime.now()
        )
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        return new_file.id
    
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code = 500, 
            detail={
                "error": "Files Data insertion error",
                "fname": "InsertFile"
            }       
        )
 
def InsertOcrResults(db: Session, file_id: int, ocr_result: list):
    try:            
        for i, line in enumerate(ocr_result):
            for content in line:
                new_record = OCR_Results(  
                    file_id=file_id,
                    page_number=i+1,
                    line_text=content['text'],
                    x=content['x'],
                    y=content['y'],
                    width=content['width'],
                    height=content['height'],
                    timestamp=datetime.datetime.now()
                )
                db.add(new_record)
        db.commit()      
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code = 500, 
            detail={
                "error": "OCR Data insertion error",
                "fname": "InsertOcrResults"
            }       
        )

    