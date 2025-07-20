from src.DataBase import Files, OCR_Results
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
import datetime
from fastapi import HTTPException, status


# def InsertFile(db:Session, filename:str, page_count: int) -> int: 
#     try:  
        
        
#     except SQLAlchemyError as e:
#         db.rollback()
#         raise HTTPException(status_code= status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Data base error: {str(e)}")
    
    
"""for i, text in enumerate(text_data):
        print(f"Page {i+1} Data -----------------------------")
        for j in text:
            print(j['text'])
            
        print(" ")
    print("Pages = ", len(text_data))"""
    
def InsertOcrResults(db: Session, page_count:int, file_name:str, ocr_result: list):
    try:        
        new_file = Files(
            file_name= file_name,
            page_count= page_count,
            upload_time= datetime.datetime.now()
        )     
        db.add(new_file)
        db.commit()
        db.refresh(new_file)
        file_id = new_file.id
        
        for i, line in enumerate(ocr_result):
            for content in line:
                new_record = OCR_Results(  
                    file_name=file_name,
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
        raise HTTPException(status_code= 500, detail=f"Data base error")
    